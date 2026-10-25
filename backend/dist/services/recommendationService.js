"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationService = void 0;
const database_1 = require("../config/database");
const parkingService_1 = require("./parkingService");
exports.recommendationService = {
    async getRecommendedZones(eventId) {
        const zonesRes = await (0, database_1.query)(`SELECT pz.*, COALESCE(tz.traffic_status, 'MODERATE') as traffic_status
       FROM parking_zones pz
       LEFT JOIN traffic_zones tz ON tz.event_id = pz.event_id AND tz.affected_gate = pz.entry_gate
       WHERE pz.event_id = $1 AND pz.status != 'FULL'
       ORDER BY pz.available_spaces DESC`, [eventId]);
        const trafficStatusWeight = { LOW: 1.0, MODERATE: 0.7, HIGH: 0.4, SEVERE: 0.1 };
        const results = [];
        for (const zone of zonesRes.rows) {
            const utilization = zone.capacity > 0 ? (zone.occupied_count / zone.capacity) * 100 : 0;
            const availabilityScore = zone.capacity > 0 ? (zone.available_spaces / zone.capacity) * 40 : 0;
            const trafficWeight = trafficStatusWeight[zone.traffic_status] || 0.7;
            const trafficScore = trafficWeight * 30;
            const queue = await parkingService_1.parkingService.getQueueEstimate(zone.id);
            const queueScore = Math.max(0, 20 - queue.waitMinutes);
            const totalScore = availabilityScore + trafficScore + queueScore;
            const reasons = [];
            if (zone.available_spaces > 200)
                reasons.push('High availability');
            if (zone.traffic_status === 'LOW')
                reasons.push('Light traffic near entrance');
            else if (zone.traffic_status === 'MODERATE')
                reasons.push('Moderate traffic');
            if (queue.waitMinutes <= 5)
                reasons.push('Short estimated queue');
            if (utilization < 50)
                reasons.push('Plenty of space available');
            if (reasons.length === 0)
                reasons.push('Alternative available option');
            results.push({
                zoneId: zone.id,
                zoneName: zone.name,
                score: Math.round(totalScore),
                reasons,
                available: zone.available_spaces,
                capacity: zone.capacity,
                utilization: Math.round(utilization),
                estimatedWait: queue.waitMinutes,
                distance: zone.location,
                entryGate: zone.entry_gate,
                exitGate: zone.exit_gate,
                trafficLevel: zone.traffic_status || 'MODERATE'
            });
        }
        return results.sort((a, b) => b.score - a.score);
    },
    async getRouteRecommendation(eventId, parkingZoneId) {
        const [eventRes, zoneRes, trafficZonesRes] = await Promise.all([
            (0, database_1.query)('SELECT * FROM events WHERE id = $1', [eventId]),
            (0, database_1.query)('SELECT * FROM parking_zones WHERE id = $1', [parkingZoneId]),
            (0, database_1.query)('SELECT * FROM traffic_zones WHERE event_id = $1 ORDER BY traffic_score ASC', [eventId])
        ]);
        const event = eventRes.rows[0];
        const zone = zoneRes.rows[0];
        const trafficZones = trafficZonesRes.rows;
        const lowTrafficRoads = trafficZones.filter((z) => z.traffic_status === 'LOW' || z.traffic_status === 'MODERATE');
        const highTrafficRoads = trafficZones.filter((z) => z.traffic_status === 'HIGH' || z.traffic_status === 'SEVERE');
        return {
            event: event?.name,
            venue: event?.venue,
            recommendedZone: zone?.name,
            entryGate: zone?.entry_gate,
            recommendedRoads: lowTrafficRoads.map((r) => ({ road: r.road_name, status: r.traffic_status })),
            avoidRoads: highTrafficRoads.map((r) => ({ road: r.road_name, status: r.traffic_status, reason: r.description })),
            estimatedTravelTime: 15 + (highTrafficRoads.length * 8),
            walkingDistance: zone?.location || '5 min walk'
        };
    }
};
//# sourceMappingURL=recommendationService.js.map