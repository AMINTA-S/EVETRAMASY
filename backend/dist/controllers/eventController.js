"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventController = void 0;
const database_1 = require("../config/database");
const trafficService_1 = require("../services/trafficService");
const auditService_1 = require("../services/auditService");
const makeId = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
});
exports.eventController = {
    async getPublicEvents(req, res) {
        try {
            const { category, date, search } = req.query;
            let sql = `
        SELECT e.*, u.name as manager_name,
               COALESCE(SUM(pz.capacity), 0) as total_parking,
               COALESCE(SUM(pz.available_spaces), 0) as total_available,
               COALESCE(SUM(pz.occupied_count), 0) as total_occupied
        FROM events e
        LEFT JOIN users u ON u.id = e.manager_id
        LEFT JOIN parking_zones pz ON pz.event_id = e.id
        WHERE e.status IN ('APPROVED', 'ACTIVE')
      `;
            const params = [];
            if (category) {
                sql += ` AND e.category = ?`;
                params.push(category);
            }
            if (date) {
                sql += ` AND e.date = ?`;
                params.push(date);
            }
            if (search) {
                sql += ` AND (e.name LIKE ? OR e.venue LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`);
            }
            sql += ' GROUP BY e.id ORDER BY e.date ASC';
            const result = await (0, database_1.query)(sql, params);
            res.json(result.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to get events' });
        }
    },
    async getEventById(req, res) {
        try {
            const { id } = req.params;
            const result = await (0, database_1.query)(`SELECT e.*, u.name as manager_name, u.email as manager_email,
                COALESCE(SUM(pz.capacity), 0) as total_parking,
                COALESCE(SUM(pz.available_spaces), 0) as total_available,
                COALESCE(SUM(pz.occupied_count), 0) as total_occupied,
                COALESCE(SUM(pz.reserved_count), 0) as total_reserved
         FROM events e
         LEFT JOIN users u ON u.id = e.manager_id
         LEFT JOIN parking_zones pz ON pz.event_id = e.id
         WHERE e.id = ?
         GROUP BY e.id`, [id]);
            if (!result.rows[0]) {
                res.status(404).json({ error: 'Event not found' });
                return;
            }
            const risk = await trafficService_1.trafficService.calculateTrafficRisk(id);
            res.json({ ...result.rows[0], trafficRisk: risk });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to get event' });
        }
    },
    async createEvent(req, res) {
        try {
            const m = req.user;
            if (m.role !== 'MANAGER' && m.role !== 'ADMIN') {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }
            const { name, category, description, date, start_time, end_time, venue, address, latitude, longitude, expected_attendees, expected_vehicle_percentage } = req.body;
            if (!name || !date || !venue) {
                res.status(400).json({ error: 'Name, date and venue required' });
                return;
            }
            const estVehicles = Math.round((expected_attendees || 0) * ((expected_vehicle_percentage || 30) / 100));
            // Admin-created events are auto-approved
            const eventStatus = m.role === 'ADMIN' ? 'APPROVED' : 'PENDING';
            const eventId = makeId();
            await (0, database_1.query)(`INSERT INTO events (id, manager_id, name, category, description, date, start_time, end_time,
                             venue, address, latitude, longitude, expected_attendees,
                             expected_vehicle_percentage, estimated_vehicle_count, traffic_risk_score, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`, [eventId, m.userId, name, category || 'OTHER', description || '', date,
                start_time || '18:00', end_time || '22:00', venue, address || venue,
                latitude || 13.0827, longitude || 80.2707,
                expected_attendees || 0, expected_vehicle_percentage || 30, estVehicles, eventStatus]);
            const eventRes = await (0, database_1.query)('SELECT * FROM events WHERE id = ?', [eventId]);
            await auditService_1.auditService.log(m.userId, 'CREATE_EVENT', `Created event: ${name}`);
            res.status(201).json(eventRes.rows[0]);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to create event' });
        }
    },
    async updateEvent(req, res) {
        try {
            const { id } = req.params;
            const eventRes = await (0, database_1.query)('SELECT * FROM events WHERE id = ?', [id]);
            if (!eventRes.rows[0]) {
                res.status(404).json({ error: 'Event not found' });
                return;
            }
            const event = eventRes.rows[0];
            if (req.user.role !== 'ADMIN' && event.manager_id !== req.user.userId) {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }
            const { name, category, description, date, start_time, end_time, venue, address, expected_attendees, expected_vehicle_percentage } = req.body;
            const newAttendees = expected_attendees || event.expected_attendees;
            const newPct = expected_vehicle_percentage || event.expected_vehicle_percentage;
            const estVehicles = Math.round(newAttendees * (newPct / 100));
            await (0, database_1.query)(`UPDATE events SET
          name=COALESCE(?,name), category=COALESCE(?,category),
          description=COALESCE(?,description), date=COALESCE(?,date),
          start_time=COALESCE(?,start_time), end_time=COALESCE(?,end_time),
          venue=COALESCE(?,venue), address=COALESCE(?,address),
          expected_attendees=COALESCE(?,expected_attendees),
          expected_vehicle_percentage=COALESCE(?,expected_vehicle_percentage),
          estimated_vehicle_count=?
         WHERE id=?`, [name, category, description, date, start_time, end_time, venue, address,
                expected_attendees, expected_vehicle_percentage, estVehicles, id]);
            const updated = await (0, database_1.query)('SELECT * FROM events WHERE id = ?', [id]);
            res.json(updated.rows[0]);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update event' });
        }
    },
    async getManagerEvents(req, res) {
        try {
            // Admin sees all events; manager sees only their own
            const isAdmin = req.user.role === 'ADMIN';
            const sql = isAdmin
                ? `SELECT e.*, u.name as manager_name,
                  COALESCE(SUM(pz.capacity),0) as total_parking,
                  COALESCE(SUM(pz.available_spaces),0) as total_available,
                  COALESCE(SUM(pz.occupied_count),0) as total_occupied,
                  COALESCE((SELECT COUNT(*) FROM reservations r WHERE r.event_id=e.id AND r.status!='CANCELLED'),0) as reservation_count
           FROM events e
           LEFT JOIN users u ON u.id = e.manager_id
           LEFT JOIN parking_zones pz ON pz.event_id = e.id
           GROUP BY e.id ORDER BY e.date DESC`
                : `SELECT e.*, u.name as manager_name,
                  COALESCE(SUM(pz.capacity),0) as total_parking,
                  COALESCE(SUM(pz.available_spaces),0) as total_available,
                  COALESCE(SUM(pz.occupied_count),0) as total_occupied,
                  COALESCE((SELECT COUNT(*) FROM reservations r WHERE r.event_id=e.id AND r.status!='CANCELLED'),0) as reservation_count
           FROM events e
           LEFT JOIN users u ON u.id = e.manager_id
           LEFT JOIN parking_zones pz ON pz.event_id = e.id
           WHERE e.manager_id = ?
           GROUP BY e.id ORDER BY e.date DESC`;
            const params = isAdmin ? [] : [req.user.userId];
            const result = await (0, database_1.query)(sql, params);
            res.json(result.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to get events' });
        }
    },
    async getEventStats(req, res) {
        try {
            const { id } = req.params;
            const [reservations, checkins, parking, risk, currentlyParked] = await Promise.all([
                (0, database_1.query)("SELECT COUNT(*) as count FROM reservations WHERE event_id=? AND status!='CANCELLED'", [id]),
                (0, database_1.query)("SELECT COUNT(*) as count FROM reservations WHERE event_id=? AND status IN ('CHECKED_IN','CHECKED_OUT')", [id]),
                (0, database_1.query)('SELECT COALESCE(SUM(capacity),0) as cap, COALESCE(SUM(occupied_count),0) as occ, COALESCE(SUM(available_spaces),0) as avail FROM parking_zones WHERE event_id=?', [id]),
                trafficService_1.trafficService.calculateTrafficRisk(id),
                (0, database_1.query)("SELECT COUNT(*) as count FROM reservations WHERE event_id=? AND status='CHECKED_IN'", [id])
            ]);
            res.json({
                reservations: parseInt(reservations.rows[0].count),
                checkIns: parseInt(checkins.rows[0].count),
                currentlyParked: parseInt(currentlyParked.rows[0].count),
                totalParking: parseInt(parking.rows[0].cap),
                occupied: parseInt(parking.rows[0].occ),
                available: parseInt(parking.rows[0].avail),
                trafficRisk: risk
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to get stats' });
        }
    }
};
//# sourceMappingURL=eventController.js.map