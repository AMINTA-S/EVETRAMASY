import { Request, Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';

const makeId = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

const makeApiKey = () =>
  'pk_' + Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join('');

export const facilityController = {
  /** POST /api/facilities — PARKING_OWNER creates a facility */
  async create(req: AuthRequest, res: Response) {
    try {
      const ownerId = req.user!.userId;
      const { name, address, latitude, longitude, total_capacity, hourly_rate } = req.body;

      if (!name || !address || !total_capacity) {
        res.status(400).json({ error: 'name, address and total_capacity are required' }); return;
      }

      const id = makeId();
      const apiKey = makeApiKey();
      const capacity = parseInt(total_capacity, 10);

      await query(
        `INSERT INTO parking_facilities
           (id, owner_id, name, address, latitude, longitude, total_capacity, occupied_count, available_spaces, hourly_rate, api_key, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'ACTIVE')`,
        [
          id, ownerId, name, address,
          latitude ?? 13.0827,
          longitude ?? 80.2707,
          capacity,
          capacity,
          hourly_rate ?? 0,
          apiKey,
        ]
      );

      const result = await query('SELECT * FROM parking_facilities WHERE id=?', [id]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Facility create error:', err);
      res.status(500).json({ error: 'Failed to create facility' });
    }
  },

  /** GET /api/facilities — Public: list all ACTIVE facilities */
  async getAll(_req: Request, res: Response) {
    try {
      const result = await query(
        `SELECT id, name, address, latitude, longitude, total_capacity,
                occupied_count, available_spaces, hourly_rate, status, created_at
         FROM parking_facilities WHERE status='ACTIVE' ORDER BY created_at DESC`,
        []
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to get facilities' });
    }
  },

  /** GET /api/facilities/my — PARKING_OWNER: list their own facilities */
  async getMy(req: AuthRequest, res: Response) {
    try {
      const result = await query(
        'SELECT * FROM parking_facilities WHERE owner_id=? ORDER BY created_at DESC',
        [req.user!.userId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to get your facilities' });
    }
  },

  /** PUT /api/facilities/:id — PARKING_OWNER: update name, address, hourly_rate */
  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const ownerId = req.user!.userId;

      const existing = await query(
        'SELECT * FROM parking_facilities WHERE id=? AND owner_id=?',
        [id, ownerId]
      );
      if (!existing.rows[0]) {
        res.status(404).json({ error: 'Facility not found or not yours' }); return;
      }

      const { name, address, hourly_rate, status } = req.body;
      const current = existing.rows[0];

      await query(
        `UPDATE parking_facilities
         SET name=?, address=?, hourly_rate=?, status=?
         WHERE id=? AND owner_id=?`,
        [
          name ?? current.name,
          address ?? current.address,
          hourly_rate ?? current.hourly_rate,
          status ?? current.status,
          id, ownerId,
        ]
      );

      const updated = await query('SELECT * FROM parking_facilities WHERE id=?', [id]);
      res.json(updated.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update facility' });
    }
  },

  /** POST /api/facilities/:id/sensor — API-key auth, update occupancy */
  async sensorUpdate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const apiKey = req.headers['x-api-key'] as string;

      if (!apiKey) {
        res.status(401).json({ error: 'API key required (x-api-key header)' }); return;
      }

      const facilityRes = await query(
        'SELECT * FROM parking_facilities WHERE id=? AND api_key=?',
        [id, apiKey]
      );
      if (!facilityRes.rows[0]) {
        res.status(401).json({ error: 'Invalid API key or facility' }); return;
      }

      const facility = facilityRes.rows[0];
      const { occupied_count } = req.body;

      if (occupied_count === undefined || occupied_count === null) {
        res.status(400).json({ error: 'occupied_count is required' }); return;
      }

      const occupied = Math.max(0, Math.min(parseInt(occupied_count, 10), facility.total_capacity));
      const available = facility.total_capacity - occupied;

      await query(
        'UPDATE parking_facilities SET occupied_count=?, available_spaces=? WHERE id=?',
        [occupied, available, id]
      );

      res.json({ message: 'Occupancy updated', occupied_count: occupied, available_spaces: available });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update sensor data' });
    }
  },

  /** POST /api/facilities/:id/event-request — PARKING_OWNER: submit a request to join an event */
  async createEventRequest(req: AuthRequest, res: Response) {
    try {
      const { id: facilityId } = req.params;
      const ownerId = req.user!.userId;
      const { event_id, requested_capacity, message } = req.body;

      if (!event_id || !requested_capacity) {
        res.status(400).json({ error: 'event_id and requested_capacity are required' }); return;
      }

      // Verify facility belongs to owner
      const facilityRes = await query(
        'SELECT * FROM parking_facilities WHERE id=? AND owner_id=?',
        [facilityId, ownerId]
      );
      if (!facilityRes.rows[0]) {
        res.status(404).json({ error: 'Facility not found or not yours' }); return;
      }

      // Verify event exists
      const eventRes = await query('SELECT id FROM events WHERE id=?', [event_id]);
      if (!eventRes.rows[0]) {
        res.status(404).json({ error: 'Event not found' }); return;
      }

      // Check for duplicate pending request
      const dupCheck = await query(
        "SELECT id FROM facility_event_requests WHERE facility_id=? AND event_id=? AND status='PENDING'",
        [facilityId, event_id]
      );
      if (dupCheck.rows.length > 0) {
        res.status(409).json({ error: 'A pending request already exists for this event' }); return;
      }

      const reqId = makeId();
      await query(
        `INSERT INTO facility_event_requests (id, facility_id, event_id, owner_id, requested_capacity, message, status)
         VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
        [reqId, facilityId, event_id, ownerId, parseInt(requested_capacity, 10), message || null]
      );

      const result = await query('SELECT * FROM facility_event_requests WHERE id=?', [reqId]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create event request' });
    }
  },

  /** GET /api/facilities/event-requests/my — PARKING_OWNER: get their own requests */
  async getMyEventRequests(req: AuthRequest, res: Response) {
    try {
      const result = await query(
        `SELECT fer.*, pf.name as facility_name, e.name as event_name, e.date as event_date
         FROM facility_event_requests fer
         JOIN parking_facilities pf ON pf.id=fer.facility_id
         JOIN events e ON e.id=fer.event_id
         WHERE fer.owner_id=? ORDER BY fer.created_at DESC`,
        [req.user!.userId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to get your event requests' });
    }
  },

  /** GET /api/facilities/event-requests/:eventId — MANAGER/ADMIN: get all requests for an event */
  async getEventRequests(req: AuthRequest, res: Response) {
    try {
      const { eventId } = req.params;

      // If MANAGER, verify they own the event
      if (req.user!.role === 'MANAGER') {
        const eventCheck = await query('SELECT id FROM events WHERE id=? AND manager_id=?', [eventId, req.user!.userId]);
        if (!eventCheck.rows[0]) {
          res.status(403).json({ error: 'Not your event' }); return;
        }
      }

      const result = await query(
        `SELECT fer.*, pf.name as facility_name, pf.address as facility_address,
                pf.total_capacity, pf.available_spaces, pf.hourly_rate,
                u.name as owner_name, u.email as owner_email
         FROM facility_event_requests fer
         JOIN parking_facilities pf ON pf.id=fer.facility_id
         JOIN users u ON u.id=fer.owner_id
         WHERE fer.event_id=? ORDER BY fer.created_at DESC`,
        [eventId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to get event requests' });
    }
  },

  /** PUT /api/facilities/event-requests/:reqId/respond — MANAGER/ADMIN: approve or reject */
  async respondToRequest(req: AuthRequest, res: Response) {
    try {
      const { reqId } = req.params;
      const { status } = req.body;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        res.status(400).json({ error: "status must be 'APPROVED' or 'REJECTED'" }); return;
      }

      const reqRes = await query('SELECT * FROM facility_event_requests WHERE id=?', [reqId]);
      if (!reqRes.rows[0]) {
        res.status(404).json({ error: 'Request not found' }); return;
      }
      const facilityReq = reqRes.rows[0];

      if (facilityReq.status !== 'PENDING') {
        res.status(400).json({ error: 'Request already processed' }); return;
      }

      // If MANAGER, verify they own the event
      if (req.user!.role === 'MANAGER') {
        const eventCheck = await query(
          'SELECT id FROM events WHERE id=? AND manager_id=?',
          [facilityReq.event_id, req.user!.userId]
        );
        if (!eventCheck.rows[0]) {
          res.status(403).json({ error: 'Not your event' }); return;
        }
      }

      await query(
        'UPDATE facility_event_requests SET status=? WHERE id=?',
        [status, reqId]
      );

      // If APPROVED, auto-create a parking_zones entry linked to the event
      if (status === 'APPROVED') {
        const facilityRes = await query('SELECT * FROM parking_facilities WHERE id=?', [facilityReq.facility_id]);
        const facility = facilityRes.rows[0];
        const zoneId = makeId();

        await query(
          `INSERT INTO parking_zones
             (id, event_id, name, location, capacity, reserved_count, occupied_count, available_spaces, status)
           VALUES (?, ?, ?, ?, ?, 0, 0, ?, 'AVAILABLE')`,
          [
            zoneId,
            facilityReq.event_id,
            facility ? facility.name : 'External Facility Zone',
            facility ? facility.address : '',
            facilityReq.requested_capacity,
            facilityReq.requested_capacity,
          ]
        );
      }

      const updated = await query('SELECT * FROM facility_event_requests WHERE id=?', [reqId]);
      res.json({ message: `Request ${status.toLowerCase()}`, request: updated.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to respond to request' });
    }
  },
};
