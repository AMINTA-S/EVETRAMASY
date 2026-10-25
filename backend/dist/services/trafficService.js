"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trafficService = void 0;
const database_1 = require("../config/database");
const notificationService_1 = require("./notificationService");
function getRiskLevel(score) {
    if (score <= 25)
        return 'LOW';
    if (score <= 50)
        return 'MODERATE';
    if (score <= 75)
        return 'HIGH';
    return 'SEVERE';
}
exports.trafficService = {
    async calculateTrafficRisk(eventId) {
        const eventRes = await (0, database_1.query)('SELECT expected_attendees, estimated_vehicle_count FROM events WHERE id = ?', [eventId]);
        if (!eventRes.rows[0])
            return { score: 0, level: 'LOW', breakdown: {} };
        const event = eventRes.rows[0];
        const zonesRes = await (0, database_1.query)('SELECT SUM(capacity) as total_cap, SUM(occupied_count) as total_occ, SUM(reserved_count) as total_res FROM parking_zones WHERE event_id = ?', [eventId]);
        const zones = zonesRes.rows[0];
        const totalCap = parseInt(zones.total_cap) || 1;
        const totalOcc = parseInt(zones.total_occ) || 0;
        const totalRes = parseInt(zones.total_res) || 0;
        const estimatedVehicles = parseInt(event.estimated_vehicle_count) || 0;
        const trafficZonesRes = await (0, database_1.query)('SELECT traffic_score FROM traffic_zones WHERE event_id = ?', [eventId]);
        const avgTrafficScore = trafficZonesRes.rows.length > 0
            ? trafficZonesRes.rows.reduce((sum, r) => sum + parseInt(r.traffic_score), 0) / trafficZonesRes.rows.length
            : 30;
        const parkingPressure = Math.min((estimatedVehicles / totalCap) * 30, 30);
        const reservationPressure = Math.min((totalRes / totalCap) * 20, 20);
        const roadCongestion = (avgTrafficScore / 100) * 25;
        const occupancyPressure = Math.min((totalOcc / totalCap) * 25, 25);
        const score = Math.round(Math.min(parkingPressure + reservationPressure + roadCongestion + occupancyPressure, 100));
        const level = getRiskLevel(score);
        await (0, database_1.query)('UPDATE events SET traffic_risk_score = ? WHERE id = ?', [score, eventId]);
        return { score, level, breakdown: { parkingPressure, reservationPressure, roadCongestion, occupancyPressure } };
    },
    async updateTrafficZone(zoneId, status, score) {
        await (0, database_1.query)('UPDATE traffic_zones SET traffic_status = ?, traffic_score = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?', [status, score, zoneId]);
        const zoneRes = await (0, database_1.query)('SELECT event_id, road_name FROM traffic_zones WHERE id = ?', [zoneId]);
        if (zoneRes.rows[0]) {
            const { event_id, road_name } = zoneRes.rows[0];
            await this.calculateTrafficRisk(event_id);
            if (status === 'SEVERE' || status === 'HIGH') {
                await (0, database_1.query)(`INSERT INTO traffic_alerts (event_id, road_id, severity, message, created_at)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`, [event_id, zoneId, status, `${status} traffic detected on ${road_name}. Consider alternative routes.`]);
                const reservationsRes = await (0, database_1.query)("SELECT DISTINCT customer_id FROM reservations WHERE event_id = ? AND status IN ('RESERVED', 'CHECKED_IN')", [event_id]);
                for (const row of reservationsRes.rows) {
                    await notificationService_1.notificationService.createNotification(row.customer_id, '🚨 Traffic Alert', `${status} traffic detected near ${road_name}. Check alternative routes.`, 'TRAFFIC_ALERT');
                }
            }
        }
    },
    async getTrafficStatusScore(status) {
        const map = { LOW: 15, MODERATE: 40, HIGH: 70, SEVERE: 90 };
        return map[status] || 30;
    }
};
//# sourceMappingURL=trafficService.js.map