import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const fineController = {
  /** GET /api/fines — CUSTOMER: get their fines */
  async getMyFines(req: AuthRequest, res: Response) {
    try {
      const result = await query(
        `SELECT f.*, r.reservation_code, r.event_id,
                e.name as event_name
         FROM fines f
         JOIN reservations r ON r.id=f.reservation_id
         LEFT JOIN events e ON e.id=r.event_id
         WHERE f.customer_id=?
         ORDER BY f.created_at DESC`,
        [req.user!.userId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to get fines' });
    }
  },

  /** PUT /api/fines/:id/pay — CUSTOMER: mark their fine as PAID (simulation) */
  async payFine(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const customerId = req.user!.userId;

      const fineRes = await query(
        'SELECT * FROM fines WHERE id=? AND customer_id=?',
        [id, customerId]
      );
      if (!fineRes.rows[0]) {
        res.status(404).json({ error: 'Fine not found' }); return;
      }

      const fine = fineRes.rows[0];
      if (fine.status === 'PAID') {
        res.status(400).json({ error: 'Fine already paid' }); return;
      }

      await query("UPDATE fines SET status='PAID' WHERE id=?", [id]);
      res.json({ message: 'Fine marked as paid', fine_id: id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to pay fine' });
    }
  },
};
