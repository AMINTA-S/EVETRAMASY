"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parkingService = void 0;
const database_1 = require("../config/database");
const notificationService_1 = require("./notificationService");
exports.parkingService = {
    async updateOccupancy(zoneId, delta) {
        await (0, database_1.query)(`UPDATE parking_zones SET
        occupied_count = MAX(0, occupied_count + $1),
        available_spaces = MAX(0, available_spaces - $1)
       WHERE id = $2`, [delta, zoneId]);
        const zoneRes = await (0, database_1.query)('SELECT * FROM parking_zones WHERE id = $1', [zoneId]);
        if (!zoneRes.rows[0])
            return;
        const zone = zoneRes.rows[0];
        const utilization = zone.capacity > 0 ? (zone.occupied_count / zone.capacity) * 100 : 0;
        let newStatus = 'AVAILABLE';
        if (utilization >= 100)
            newStatus = 'FULL';
        else if (utilization >= 90)
            newStatus = 'CRITICAL';
        else if (utilization >= 80)
            newStatus = 'NEARLY_FULL';
        await (0, database_1.query)('UPDATE parking_zones SET status = $1 WHERE id = $2', [newStatus, zoneId]);
        if (utilization >= 80) {
            const reservationsRes = await (0, database_1.query)(`SELECT DISTINCT r.customer_id FROM reservations r
         WHERE r.event_id = $1 AND r.status = 'RESERVED'`, [zone.event_id]);
            for (const row of reservationsRes.rows) {
                const msg = utilization >= 100
                    ? `Zone ${zone.name} is now FULL.`
                    : `Zone ${zone.name} is ${Math.round(utilization)}% full.`;
                await notificationService_1.notificationService.createNotification(row.customer_id, '🅿️ Parking Alert', msg, 'PARKING_ALERT');
            }
        }
    },
    async reserveSpot(zoneId) {
        const client = await (0, database_1.getClient)();
        try {
            await client.query('BEGIN');
            const res = await client.query('SELECT available_spaces FROM parking_zones WHERE id = $1', [zoneId]);
            if (!res.rows[0] || res.rows[0].available_spaces <= 0) {
                await client.query('ROLLBACK');
                return false;
            }
            await client.query('UPDATE parking_zones SET reserved_count = reserved_count + 1, available_spaces = available_spaces - 1 WHERE id = $1', [zoneId]);
            await client.query('COMMIT');
            return true;
        }
        catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }
        finally {
            client.release();
        }
    },
    async releaseReservation(zoneId) {
        await (0, database_1.query)('UPDATE parking_zones SET reserved_count = MAX(0, reserved_count - 1), available_spaces = available_spaces + 1 WHERE id = $1', [zoneId]);
    },
    async getQueueEstimate(zoneId) {
        const res = await (0, database_1.query)('SELECT occupied_count, capacity, available_spaces FROM parking_zones WHERE id = $1', [zoneId]);
        if (!res.rows[0])
            return { queueLength: 0, waitMinutes: 0 };
        const { occupied_count, capacity } = res.rows[0];
        const utilization = capacity > 0 ? occupied_count / capacity : 0;
        const queueLength = Math.max(0, Math.round(utilization * 15));
        const waitMinutes = Math.max(1, Math.round(queueLength * 0.4));
        return { queueLength, waitMinutes };
    }
};
//# sourceMappingURL=parkingService.js.map