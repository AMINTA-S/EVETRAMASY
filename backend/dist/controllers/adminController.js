"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const database_1 = require("../config/database");
const auditService_1 = require("../services/auditService");
const notificationService_1 = require("../services/notificationService");
exports.adminController = {
    async getUsers(req, res) {
        try {
            const { role, status } = req.query;
            let sql = 'SELECT id,name,email,phone,role,status,created_at FROM users WHERE 1=1';
            const params = [];
            if (role) {
                sql += ` AND role=?`;
                params.push(role);
            }
            if (status) {
                sql += ` AND status=?`;
                params.push(status);
            }
            sql += ' ORDER BY created_at DESC';
            const result = await (0, database_1.query)(sql, params);
            res.json(result.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to get users' });
        }
    },
    async updateUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
                res.status(400).json({ error: 'Invalid status' });
                return;
            }
            await (0, database_1.query)('UPDATE users SET status=? WHERE id=?', [status, id]);
            const updated = await (0, database_1.query)('SELECT id,name,email,role,status FROM users WHERE id=?', [id]);
            if (!updated.rows[0]) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            await auditService_1.auditService.log(req.user.userId, 'UPDATE_USER_STATUS', `Changed user ${id} status to ${status}`);
            if (status === 'ACTIVE') {
                await notificationService_1.notificationService.createNotification(id, '✅ Account Approved', 'Your account has been approved. You can now create events.', 'SYSTEM');
            }
            else if (status === 'SUSPENDED') {
                await notificationService_1.notificationService.createNotification(id, '⛔ Account Suspended', 'Your account has been suspended. Contact support.', 'SYSTEM');
            }
            res.json(updated.rows[0]);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update user' });
        }
    },
    async getAllEvents(req, res) {
        try {
            const result = await (0, database_1.query)(`SELECT e.*, u.name as manager_name,
                COALESCE(SUM(pz.capacity),0) as total_parking,
                COALESCE(SUM(pz.occupied_count),0) as total_occupied,
                COALESCE((SELECT COUNT(*) FROM reservations r WHERE r.event_id=e.id AND r.status!='CANCELLED'),0) as reservation_count
         FROM events e
         LEFT JOIN users u ON u.id=e.manager_id
         LEFT JOIN parking_zones pz ON pz.event_id=e.id
         GROUP BY e.id ORDER BY e.created_at DESC`);
            res.json(result.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to get events' });
        }
    },
    async approveEvent(req, res) {
        try {
            const { id } = req.params;
            const eventCheck = await (0, database_1.query)('SELECT * FROM events WHERE id=?', [id]);
            if (!eventCheck.rows[0]) {
                res.status(404).json({ error: 'Event not found' });
                return;
            }
            const event = eventCheck.rows[0];
            await (0, database_1.query)("UPDATE events SET status='APPROVED' WHERE id=?", [id]);
            await notificationService_1.notificationService.createNotification(event.manager_id, '✅ Event Approved', `"${event.name}" is now live and visible to customers.`, 'SYSTEM');
            await auditService_1.auditService.log(req.user.userId, 'APPROVE_EVENT', `Approved event: ${event.name}`);
            res.json({ message: 'Event approved', event });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to approve event' });
        }
    },
    async rejectEvent(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const eventCheck = await (0, database_1.query)('SELECT * FROM events WHERE id=?', [id]);
            if (!eventCheck.rows[0]) {
                res.status(404).json({ error: 'Event not found' });
                return;
            }
            const event = eventCheck.rows[0];
            await (0, database_1.query)("UPDATE events SET status='REJECTED' WHERE id=?", [id]);
            await notificationService_1.notificationService.createNotification(event.manager_id, '❌ Event Rejected', `"${event.name}" was rejected. Reason: ${reason || 'Not specified'}`, 'SYSTEM');
            await auditService_1.auditService.log(req.user.userId, 'REJECT_EVENT', `Rejected event: ${event.name}`);
            res.json({ message: 'Event rejected', event });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to reject event' });
        }
    },
    async getAnalytics(req, res) {
        try {
            const [users, eventStatus, reservations, vehicles, alerts, highRisk, currentlyParked, totalEvents] = await Promise.all([
                (0, database_1.query)('SELECT role, COUNT(*) as count FROM users GROUP BY role'),
                (0, database_1.query)('SELECT status, COUNT(*) as count FROM events GROUP BY status'),
                (0, database_1.query)('SELECT status, COUNT(*) as count FROM reservations GROUP BY status'),
                (0, database_1.query)('SELECT vehicle_type, COUNT(*) as count FROM vehicles GROUP BY vehicle_type'),
                (0, database_1.query)('SELECT COUNT(*) as count FROM traffic_alerts WHERE resolved_at IS NULL'),
                (0, database_1.query)("SELECT COUNT(*) as count FROM events WHERE traffic_risk_score >= 51 AND status IN ('APPROVED','ACTIVE')"),
                (0, database_1.query)("SELECT COUNT(*) as count FROM reservations WHERE status='CHECKED_IN'"),
                (0, database_1.query)('SELECT COUNT(*) as count FROM events')
            ]);
            res.json({
                users: users.rows,
                eventStatus: eventStatus.rows,
                reservations: reservations.rows,
                vehicles: vehicles.rows,
                activeAlerts: parseInt(alerts.rows[0].count || '0'),
                highRiskEvents: parseInt(highRisk.rows[0].count || '0'),
                currentlyParked: parseInt(currentlyParked.rows[0].count || '0'),
                totalEvents: parseInt(totalEvents.rows[0].count || '0')
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to get analytics' });
        }
    },
    async getAuditLogs(req, res) {
        try {
            const logs = await auditService_1.auditService.getLogs(200, 0);
            res.json(logs);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to get logs' });
        }
    },
    async getFines(req, res) {
        try {
            const result = await (0, database_1.query)(`SELECT f.*, u.name as customer_name, u.email, r.reservation_code
         FROM fines f
         JOIN users u ON u.id = f.customer_id
         JOIN reservations r ON r.id = f.reservation_id
         ORDER BY f.created_at DESC`, []);
            res.json(result.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to get fines' });
        }
    },
    async getFineSettings(req, res) {
        try {
            const result = await (0, database_1.query)('SELECT * FROM system_settings', []);
            const settings = {};
            result.rows.forEach((r) => { settings[r.key] = r.value; });
            res.json(settings);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to get settings' });
        }
    },
    async updateFineSettings(req, res) {
        try {
            const { overstay_fine_per_hour } = req.body;
            if (overstay_fine_per_hour !== undefined) {
                await (0, database_1.query)("INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES ('overstay_fine_per_hour', ?, CURRENT_TIMESTAMP)", [String(overstay_fine_per_hour)]);
            }
            res.json({ message: 'Settings updated' });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update settings' });
        }
    }
};
//# sourceMappingURL=adminController.js.map