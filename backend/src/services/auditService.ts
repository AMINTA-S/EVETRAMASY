import { query } from '../config/database';

export const auditService = {
  async log(userId: string, action: string, description: string): Promise<void> {
    await query(
      'INSERT INTO audit_logs (user_id, action, description, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [userId, action, description]
    ).catch(console.error);
  },

  async getLogs(limit = 100, offset = 0) {
    const res = await query(
      `SELECT al.*, u.name as user_name, u.email, u.role
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ORDER BY al.timestamp DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return res.rows;
  }
};
