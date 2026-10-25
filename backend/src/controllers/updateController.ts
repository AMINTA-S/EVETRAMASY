import { Request, Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notificationService';
import { forecastService } from '../services/forecastService';
import { simulationService } from '../services/simulationService';

const makeId = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

export const updateController = {
  async getEventUpdates(req: Request, res: Response) {
    try {
      const result = await query(
        `SELECT eu.*, u.name as manager_name FROM event_updates eu
         JOIN users u ON u.id=eu.manager_id
         WHERE eu.event_id=? ORDER BY eu.created_at DESC`,
        [req.params.eventId]
      );
      res.json(result.rows);
    } catch(err) { console.error(err); res.status(500).json({ error: 'Failed to get updates' }); }
  },

  async createUpdate(req: AuthRequest, res: Response) {
    try {
      const { eventId } = req.params;
      const { title, message } = req.body;
      if (!title || !message) { res.status(400).json({ error: 'Title and message required' }); return; }
      const updateId = makeId();
      await query(
        'INSERT INTO event_updates (id,event_id,manager_id,title,message) VALUES (?,?,?,?,?)',
        [updateId, eventId, req.user!.userId, title, message]
      );
      const attendees = await query(
        "SELECT DISTINCT customer_id FROM reservations WHERE event_id=? AND status NOT IN ('CANCELLED','EXPIRED')",
        [eventId]
      );
      for (const row of attendees.rows) {
        await notificationService.createNotification(row.customer_id, `📢 ${title}`, message, 'EVENT_UPDATE');
      }
      const update = await query('SELECT * FROM event_updates WHERE id=?', [updateId]);
      res.status(201).json(update.rows[0]);
    } catch(err) { console.error(err); res.status(500).json({ error: 'Failed to post update' }); }
  },

  async getNotifications(req: AuthRequest, res: Response) {
    try {
      const notifs = await notificationService.getUserNotifications(req.user!.userId);
      const unread = await notificationService.getUnreadCount(req.user!.userId);
      res.json({ notifications: notifs, unreadCount: unread });
    } catch(err) { res.status(500).json({ error: 'Failed to get notifications' }); }
  },

  async markRead(req: AuthRequest, res: Response) {
    try {
      await notificationService.markRead(req.params.id, req.user!.userId);
      res.json({ message: 'Marked as read' });
    } catch(err) { res.status(500).json({ error: 'Failed to mark read' }); }
  },

  async markAllRead(req: AuthRequest, res: Response) {
    try {
      await notificationService.markAllRead(req.user!.userId);
      res.json({ message: 'All marked as read' });
    } catch(err) { res.status(500).json({ error: 'Failed to mark all read' }); }
  },

  async getForecast(req: Request, res: Response) {
    try {
      const forecast = await forecastService.generateForecast(req.params.eventId);
      res.json(forecast);
    } catch(err) { res.status(500).json({ error: 'Failed to generate forecast' }); }
  },

  async startSimulation(req: AuthRequest, res: Response) {
    try {
      const { eventId } = req.params;
      if (simulationService.isRunning(eventId)) {
        res.status(400).json({ error: 'Simulation already running' }); return;
      }
      await simulationService.startSimulation(eventId);
      res.json({ message: 'Simulation started', steps: simulationService.getSteps() });
    } catch(err) { console.error(err); res.status(500).json({ error: 'Failed to start simulation' }); }
  },

  async stopSimulation(req: AuthRequest, res: Response) {
    try {
      simulationService.stopSimulation(req.params.eventId);
      res.json({ message: 'Simulation stopped' });
    } catch(err) { res.status(500).json({ error: 'Failed to stop simulation' }); }
  },

  async getSimulationStatus(req: Request, res: Response) {
    try {
      res.json({
        running: simulationService.isRunning(req.params.eventId),
        steps: simulationService.getSteps()
      });
    } catch(err) { res.status(500).json({ error: 'Failed to get status' }); }
  }
};
