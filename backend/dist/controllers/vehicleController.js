"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleController = void 0;
const database_1 = require("../config/database");
const makeId = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
});
exports.vehicleController = {
    async getMyVehicles(req, res) {
        try {
            const result = await (0, database_1.query)('SELECT * FROM vehicles WHERE customer_id=? ORDER BY rowid', [req.user.userId]);
            res.json(result.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to get vehicles' });
        }
    },
    async addVehicle(req, res) {
        try {
            const { vehicle_type, vehicle_number, model, color } = req.body;
            if (!vehicle_type || !vehicle_number || !model || !color) {
                res.status(400).json({ error: 'All fields required' });
                return;
            }
            const existing = await (0, database_1.query)('SELECT id FROM vehicles WHERE vehicle_number=?', [vehicle_number.toUpperCase()]);
            if (existing.rows.length > 0) {
                res.status(409).json({ error: 'Vehicle number already registered' });
                return;
            }
            const vehicleId = makeId();
            await (0, database_1.query)('INSERT INTO vehicles (id, customer_id, vehicle_type, vehicle_number, model, color) VALUES (?,?,?,?,?,?)', [vehicleId, req.user.userId, vehicle_type, vehicle_number.toUpperCase(), model, color]);
            const vehicle = await (0, database_1.query)('SELECT * FROM vehicles WHERE id=?', [vehicleId]);
            res.status(201).json(vehicle.rows[0]);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to add vehicle' });
        }
    },
    async updateVehicle(req, res) {
        try {
            const { id } = req.params;
            const { model, color } = req.body;
            await (0, database_1.query)('UPDATE vehicles SET model=COALESCE(?,model), color=COALESCE(?,color) WHERE id=? AND customer_id=?', [model, color, id, req.user.userId]);
            const updated = await (0, database_1.query)('SELECT * FROM vehicles WHERE id=?', [id]);
            if (!updated.rows[0]) {
                res.status(404).json({ error: 'Vehicle not found' });
                return;
            }
            res.json(updated.rows[0]);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update vehicle' });
        }
    },
    async deleteVehicle(req, res) {
        try {
            const { id } = req.params;
            await (0, database_1.query)('DELETE FROM vehicles WHERE id=? AND customer_id=?', [id, req.user.userId]);
            res.json({ message: 'Vehicle removed' });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to delete vehicle' });
        }
    }
};
//# sourceMappingURL=vehicleController.js.map