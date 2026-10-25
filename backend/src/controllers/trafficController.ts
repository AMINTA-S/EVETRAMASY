import { Request, Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { trafficService } from '../services/trafficService';

const makeId = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

export const trafficController = {
  async getEventTrafficZones(req: Request, res: Response) {
    try {
      const result = await query('SELECT * FROM traffic_zones WHERE event_id=? ORDER BY road_name', [req.params.eventId]);
      res.json(result.rows);
    } catch(err) { console.error(err); res.status(500).json({ error: 'Failed to get traffic zones' }); }
  },

  async createTrafficZone(req: AuthRequest, res: Response) {
    try {
      const { eventId } = req.params;
      const { road_name, traffic_status, description, affected_gate } = req.body;
      if (!road_name) { res.status(400).json({ error: 'road_name required' }); return; }
      const score = await trafficService.getTrafficStatusScore(traffic_status || 'LOW');
      const zoneId = makeId();
      await query(
        `INSERT INTO traffic_zones (id,event_id,road_name,traffic_status,traffic_score,description,affected_gate)
         VALUES (?,?,?,?,?,?,?)`,
        [zoneId, eventId, road_name, traffic_status || 'LOW', score, description || '', affected_gate || '']
      );
      const zone = await query('SELECT * FROM traffic_zones WHERE id=?', [zoneId]);
      res.status(201).json(zone.rows[0]);
    } catch(err) { console.error(err); res.status(500).json({ error: 'Failed to create zone' }); }
  },

  async updateTrafficZone(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { traffic_status, description } = req.body;
      const score = await trafficService.getTrafficStatusScore(traffic_status);
      await trafficService.updateTrafficZone(id, traffic_status, score);
      if (description) {
        await query('UPDATE traffic_zones SET description=? WHERE id=?', [description, id]);
      }
      const result = await query('SELECT * FROM traffic_zones WHERE id=?', [id]);
      res.json(result.rows[0]);
    } catch(err) { console.error(err); res.status(500).json({ error: 'Failed to update' }); }
  },

  async getTrafficRisk(req: Request, res: Response) {
    try {
      const risk = await trafficService.calculateTrafficRisk(req.params.eventId);
      res.json(risk);
    } catch(err) { res.status(500).json({ error: 'Failed to calculate risk' }); }
  },

  async getEventAlerts(req: Request, res: Response) {
    try {
      const result = await query(
        `SELECT ta.*, tz.road_name FROM traffic_alerts ta
         LEFT JOIN traffic_zones tz ON tz.id=ta.road_id
         WHERE ta.event_id=? AND ta.resolved_at IS NULL
         ORDER BY ta.created_at DESC LIMIT 20`,
        [req.params.eventId]
      );
      res.json(result.rows);
    } catch(err) { res.status(500).json({ error: 'Failed to get alerts' }); }
  },

  async getEventGates(req: Request, res: Response) {
    try {
      const result = await query('SELECT * FROM gates WHERE event_id=? ORDER BY name', [req.params.eventId]);
      res.json(result.rows);
    } catch(err) { res.status(500).json({ error: 'Failed to get gates' }); }
  },

  async createGate(req: AuthRequest, res: Response) {
    try {
      const { eventId } = req.params;
      const { name, type, status } = req.body;
      const gateId = makeId();
      await query(
        `INSERT INTO gates (id,event_id,name,type,status,queue_length,estimated_wait_time) VALUES (?,?,?,?,?,0,0)`,
        [gateId, eventId, name, type || 'ENTRY', status || 'OPEN']
      );
      const gate = await query('SELECT * FROM gates WHERE id=?', [gateId]);
      res.status(201).json(gate.rows[0]);
    } catch(err) { console.error(err); res.status(500).json({ error: 'Failed to create gate' }); }
  },

  async updateGate(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, queue_length } = req.body;
      const waitTime = Math.round((queue_length || 0) * 0.5);
      await query(
        'UPDATE gates SET status=?, queue_length=?, estimated_wait_time=? WHERE id=?',
        [status, queue_length || 0, waitTime, id]
      );
      const result = await query('SELECT * FROM gates WHERE id=?', [id]);
      if (!result.rows[0]) { res.status(404).json({ error: 'Gate not found' }); return; }
      res.json(result.rows[0]);
    } catch(err) { res.status(500).json({ error: 'Failed to update gate' }); }
  }
};
