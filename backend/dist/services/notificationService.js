"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const database_1 = require("../config/database");
exports.notificationService = {
    async createNotification(userId, title, message, type) {
        await (0, database_1.query)(`INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, ?, false, CURRENT_TIMESTAMP)`, [userId, title, message, type]);
    },
    async getUserNotifications(userId) {
        const res = await (0, database_1.query)('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId]);
        return res.rows;
    },
    async markRead(notificationId, userId) {
        await (0, database_1.query)('UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?', [notificationId, userId]);
    },
    async markAllRead(userId) {
        await (0, database_1.query)('UPDATE notifications SET is_read = true WHERE user_id = ?', [userId]);
    },
    async getUnreadCount(userId) {
        const res = await (0, database_1.query)('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false', [userId]);
        return parseInt(res.rows[0].count);
    }
};
//# sourceMappingURL=notificationService.js.map