"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parkingController = void 0;
const database_1 = require("../config/database");
const recommendationService_1 = require("../services/recommendationService");
const makeId = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
});
exports.parkingController = {
    async getEventParkingZones(req, res) {
        try {
            const result = await (0, database_1.query)('SELECT * FROM parking_zones WHERE event_id=? ORDER BY name', [req.params.eventId]);
            res.json(result.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to get parking zones' });
        }
    },
    async createParkingZone(req, res) {
        try {
            const { eventId } = req.params;
            const { name, location, capacity, entry_gate, exit_gate, latitude, longitude } = req.body;
            if (!name || !capacity) {
                res.status(400).json({ error: 'Name and capacity required' });
                return;
            }
            const cap = parseInt(capacity);
            const zoneId = makeId();
            await (0, database_1.query)(`INSERT INTO parking_zones (id,event_id,name,location,capacity,reserved_count,occupied_count,available_spaces,entry_gate,exit_gate,latitude,longitude,status)
         VALUES (?,?,?,?,?,0,0,?,?,?,?,?,'AVAILABLE')`, [zoneId, eventId, name, location || '', cap, cap, entry_gate || 'Gate A', exit_gate || 'Gate B', latitude || 13.0827, longitude || 80.2707]);
            const zone = await (0, database_1.query)('SELECT * FROM parking_zones WHERE id=?', [zoneId]);
            res.status(201).json(zone.rows[0]);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to create zone' });
        }
    },
    async updateParkingZone(req, res) {
        try {
            const { id } = req.params;
            const fields = req.body;
            const result = await (0, database_1.query)('SELECT * FROM parking_zones WHERE id=?', [id]);
            if (!result.rows[0]) {
                res.status(404).json({ error: 'Zone not found' });
                return;
            }
            const z = result.rows[0];
            const newCap = fields.capacity !== undefined ? parseInt(fields.capacity) : z.capacity;
            const newOcc = fields.occupied_count !== undefined ? parseInt(fields.occupied_count) : z.occupied_count;
            const newAvail = Math.max(0, newCap - newOcc);
            const newRes = fields.reserved_count !== undefined ? parseInt(fields.reserved_count) : z.reserved_count;
            const status = newAvail < newCap * 0.05 ? 'FULL' : newAvail < newCap * 0.15 ? 'CRITICAL' : newAvail < newCap * 0.25 ? 'NEARLY_FULL' : 'AVAILABLE';
            await (0, database_1.query)(`UPDATE parking_zones SET
          name=COALESCE(?,name), capacity=?, occupied_count=?, available_spaces=?,
          reserved_count=?, status=?, entry_gate=COALESCE(?,entry_gate), exit_gate=COALESCE(?,exit_gate)
         WHERE id=?`, [fields.name, newCap, newOcc, newAvail, newRes, status, fields.entry_gate, fields.exit_gate, id]);
            const updated = await (0, database_1.query)('SELECT * FROM parking_zones WHERE id=?', [id]);
            res.json(updated.rows[0]);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update zone' });
        }
    },
    async getRecommendations(req, res) {
        try {
            const recs = await recommendationService_1.recommendationService.getRecommendedZones(req.params.eventId);
            res.json(recs);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to get recommendations' });
        }
    },
    async getRouteRecommendation(req, res) {
        try {
            const { eventId } = req.params;
            const { zoneId } = req.query;
            if (!zoneId) {
                res.status(400).json({ error: 'zoneId required' });
                return;
            }
            const route = await recommendationService_1.recommendationService.getRouteRecommendation(eventId, zoneId);
            res.json(route);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to get route' });
        }
    }
};
//# sourceMappingURL=parkingController.js.map