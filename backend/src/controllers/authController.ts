import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { signToken } from '../utils/jwt';
import { auditService } from '../services/auditService';
import { AuthRequest } from '../middleware/auth';

// Simple UUID generator (no uuid package dependency)
const makeId = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, phone, password, role } = req.body;
      if (!name || !email || !password || !role) {
        res.status(400).json({ error: 'Missing required fields' }); return;
      }
      if (!['CUSTOMER', 'MANAGER', 'PARKING_OWNER'].includes(role)) {
        res.status(400).json({ error: 'Invalid role' }); return;
      }
      const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.rows.length > 0) {
        res.status(409).json({ error: 'Email already registered' }); return;
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const userStatus = role === 'MANAGER' ? 'PENDING' : 'ACTIVE';
      const userId = makeId();

      // INSERT without RETURNING (SQLite workaround)
      await query(
        `INSERT INTO users (id, name, email, phone, password_hash, role, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, name, email, phone || null, passwordHash, role, userStatus]
      );

      // Fetch back the inserted user
      const userRes = await query('SELECT id, name, email, role, status FROM users WHERE id = ?', [userId]);
      const user = userRes.rows[0];

      if (!user) {
        res.status(500).json({ error: 'Registration failed — could not create user' }); return;
      }

      if (userStatus === 'ACTIVE') {
        const token = signToken({ userId: user.id, email: user.email, role: user.role });
        await auditService.log(user.id, 'REGISTER', `New ${role} registered: ${email}`);
        res.status(201).json({ token, user });
      } else {
        await auditService.log(user.id, 'REGISTER', `New MANAGER registered (pending): ${email}`);
        res.status(201).json({ user, message: 'Registration submitted. Awaiting admin approval.' });
      }
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password required' }); return;
      }
      const result = await query('SELECT * FROM users WHERE email = ?', [email]);
      const user = result.rows[0];
      if (!user) { res.status(401).json({ error: 'Invalid credentials' }); return; }
      if (user.status === 'SUSPENDED') { res.status(403).json({ error: 'Account suspended' }); return; }
      if (user.status === 'PENDING') { res.status(403).json({ error: 'Account pending approval. Contact admin.' }); return; }
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) { res.status(401).json({ error: 'Invalid credentials' }); return; }
      const token = signToken({ userId: user.id, email: user.email, role: user.role });
      await auditService.log(user.id, 'LOGIN', `User logged in: ${email}`);
      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  async me(req: AuthRequest, res: Response) {
    try {
      const result = await query(
        'SELECT id, name, email, phone, role, status, created_at FROM users WHERE id = ?',
        [req.user!.userId]
      );
      if (!result.rows[0]) { res.status(404).json({ error: 'User not found' }); return; }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get user info' });
    }
  }
};
