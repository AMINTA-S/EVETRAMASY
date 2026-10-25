import { query } from '../config/database';

export const notificationService = {
  async createNotification(userId: string, title: string, message: string, type: string): Promise<void> {
    await query(
      `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, ?, false, CURRENT_TIMESTAMP)`,
      [userId, title, message, type]
    );
  },
  async getUserNotifications(userId: string) {
    const res = await query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    return res.rows;
  },
  async markRead(notificationId: string, userId: string): Promise<void> {
    await query('UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?', [notificationId, userId]);
  },
  async markAllRead(userId: string): Promise<void> {
    await query('UPDATE notifications SET is_read = true WHERE user_id = ?', [userId]);
  },
  async getUnreadCount(userId: string): Promise<number> {
    const res = await query('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false', [userId]);
    return parseInt(res.rows[0].count);
  }
};
