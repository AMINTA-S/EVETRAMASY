"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservationController = void 0;
const database_1 = require("../config/database");
const parkingService_1 = require("../services/parkingService");
const qrService_1 = require("../services/qrService");
const notificationService_1 = require("../services/notificationService");
const auditService_1 = require("../services/auditService");
const makeId = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
});
exports.reservationController = {
    async createReservation(req, res) {
        try {
            // Accept both camelCase (from frontend) and snake_case
            const eventId = req.body.event_id || req.body.eventId;
            const vehicleId = req.body.vehicle_id || req.body.vehicleId;
            const parkingZoneId = req.body.parking_zone_id || req.body.parkingZoneId;
            const customerId = req.user.userId;
            const bookingStart = req.body.booking_start || req.body.bookingStart;
            const bookingEnd = req.body.booking_end || req.body.bookingEnd;
            const parkingType = req.body.parking_type || req.body.parkingType || 'EVENT';
            const facilityId = req.body.facility_id || req.body.facilityId;
            if (!vehicleId) {
                res.status(400).json({ error: 'vehicle_id is required' });
                return;
            }
            // ── GENERAL parking (no event) ──────────────────────────────────────────
            if (parkingType === 'GENERAL') {
                if (!facilityId) {
                    res.status(400).json({ error: 'facility_id is required for GENERAL parking' });
                    return;
                }
                const facilityRes = await (0, database_1.query)("SELECT * FROM parking_facilities WHERE id=? AND status='ACTIVE'", [facilityId]);
                if (!facilityRes.rows[0]) {
                    res.status(400).json({ error: 'Facility not found or not active' });
                    return;
                }
                const facility = facilityRes.rows[0];
                if (facility.available_spaces <= 0) {
                    res.status(409).json({ error: 'No available spaces in this facility' });
                    return;
                }
                const vehicleRes = await (0, database_1.query)('SELECT * FROM vehicles WHERE id=? AND customer_id=?', [vehicleId, customerId]);
                if (!vehicleRes.rows[0]) {
                    res.status(400).json({ error: 'Vehicle not found or does not belong to you' });
                    return;
                }
                const qrToken = qrService_1.qrService.generateToken();
                const code = 'GEN-' + Date.now().toString().slice(-8);
                const reservationId = makeId();
                const resolvedStart = bookingStart || null;
                const resolvedEnd = bookingEnd || null;
                await (0, database_1.query)(`INSERT INTO reservations
             (id, customer_id, event_id, vehicle_id, parking_zone_id, reservation_code, qr_token,
              status, facility_id, booking_start, booking_end, parking_type)
           VALUES (?, ?, NULL, ?, ?, ?, ?, 'RESERVED', ?, ?, ?, 'GENERAL')`, [reservationId, customerId, vehicleId, parkingZoneId || '', code, qrToken,
                    facilityId, resolvedStart, resolvedEnd]);
                const reservation = await (0, database_1.query)('SELECT * FROM reservations WHERE id=?', [reservationId]);
                await notificationService_1.notificationService.createNotification(customerId, '✅ Parking Reserved', `General parking reserved. Code: ${code}`, 'RESERVATION');
                await auditService_1.auditService.log(customerId, 'CREATE_RESERVATION', `General parking at facility ${facilityId}`);
                res.status(201).json(reservation.rows[0]);
                return;
            }
            // ── EVENT parking ────────────────────────────────────────────────────────
            if (!eventId || !parkingZoneId) {
                res.status(400).json({ error: 'event_id, vehicle_id and parking_zone_id are required' });
                return;
            }
            const eventRes = await (0, database_1.query)("SELECT * FROM events WHERE id=? AND status IN ('APPROVED','ACTIVE')", [eventId]);
            if (!eventRes.rows[0]) {
                res.status(400).json({ error: 'Event not found or not available for booking' });
                return;
            }
            const event = eventRes.rows[0];
            const vehicleRes = await (0, database_1.query)('SELECT * FROM vehicles WHERE id=? AND customer_id=?', [vehicleId, customerId]);
            if (!vehicleRes.rows[0]) {
                res.status(400).json({ error: 'Vehicle not found or does not belong to you' });
                return;
            }
            const existing = await (0, database_1.query)("SELECT id FROM reservations WHERE customer_id=? AND event_id=? AND status NOT IN ('CANCELLED','EXPIRED')", [customerId, eventId]);
            if (existing.rows.length > 0) {
                res.status(409).json({ error: 'You already have a reservation for this event' });
                return;
            }
            const reserved = await parkingService_1.parkingService.reserveSpot(parkingZoneId);
            if (!reserved) {
                res.status(409).json({ error: 'No available parking spots in this zone' });
                return;
            }
            const qrToken = qrService_1.qrService.generateToken();
            const code = 'EVT-' + Date.now().toString().slice(-8);
            const reservationId = makeId();
            const resolvedStart = bookingStart || event.start_time || null;
            const resolvedEnd = bookingEnd || event.end_time || null;
            await (0, database_1.query)(`INSERT INTO reservations
           (id, customer_id, event_id, vehicle_id, parking_zone_id, reservation_code, qr_token,
            status, facility_id, booking_start, booking_end, parking_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'RESERVED', ?, ?, ?, 'EVENT')`, [reservationId, customerId, eventId, vehicleId, parkingZoneId, code, qrToken,
                facilityId || null, resolvedStart, resolvedEnd]);
            const reservation = await (0, database_1.query)('SELECT * FROM reservations WHERE id = ?', [reservationId]);
            await notificationService_1.notificationService.createNotification(customerId, '✅ Reservation Confirmed', `Parking reserved for this event. Code: ${code}`, 'RESERVATION');
            await auditService_1.auditService.log(customerId, 'CREATE_RESERVATION', `Reserved zone ${parkingZoneId} for event ${eventId}`);
            res.status(201).json(reservation.rows[0]);
        }
        catch (err) {
            console.error('Reservation error:', err);
            res.status(500).json({ error: 'Failed to create reservation' });
        }
    },
    async getMyReservations(req, res) {
        try {
            const result = await (0, database_1.query)(`SELECT r.*,
                e.name as event_name, e.date, e.start_time, e.end_time, e.venue, e.address,
                v.vehicle_number, v.model, v.color, v.vehicle_type,
                pz.name as zone_name, pz.entry_gate, pz.exit_gate, pz.location as zone_location
         FROM reservations r
         LEFT JOIN events e ON e.id=r.event_id
         JOIN vehicles v ON v.id=r.vehicle_id
         LEFT JOIN parking_zones pz ON pz.id=r.parking_zone_id
         WHERE r.customer_id=? ORDER BY r.reserved_at DESC`, [req.user.userId]);
            res.json(result.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to get reservations' });
        }
    },
    async getReservationById(req, res) {
        try {
            const { id } = req.params;
            const result = await (0, database_1.query)(`SELECT r.*, e.name as event_name, e.date, e.start_time, e.end_time, e.venue,
                v.vehicle_number, v.model, v.color,
                pz.name as zone_name, pz.entry_gate, pz.exit_gate
         FROM reservations r
         LEFT JOIN events e ON e.id=r.event_id
         JOIN vehicles v ON v.id=r.vehicle_id
         LEFT JOIN parking_zones pz ON pz.id=r.parking_zone_id
         WHERE r.id=?`, [id]);
            if (!result.rows[0]) {
                res.status(404).json({ error: 'Reservation not found' });
                return;
            }
            const r = result.rows[0];
            if (req.user.role === 'CUSTOMER' && r.customer_id !== req.user.userId) {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }
            res.json(r);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to get reservation' });
        }
    },
    async cancelReservation(req, res) {
        try {
            const { id } = req.params;
            const result = await (0, database_1.query)('SELECT * FROM reservations WHERE id=?', [id]);
            if (!result.rows[0]) {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            const r = result.rows[0];
            if (req.user.role === 'CUSTOMER' && r.customer_id !== req.user.userId) {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }
            if (r.status !== 'RESERVED') {
                res.status(400).json({ error: 'Cannot cancel this reservation' });
                return;
            }
            await (0, database_1.query)("UPDATE reservations SET status='CANCELLED' WHERE id=?", [id]);
            if (r.parking_zone_id) {
                await parkingService_1.parkingService.releaseReservation(r.parking_zone_id);
            }
            await notificationService_1.notificationService.createNotification(r.customer_id, '❌ Reservation Cancelled', `Reservation ${r.reservation_code} has been cancelled.`, 'RESERVATION');
            res.json({ message: 'Reservation cancelled' });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to cancel reservation' });
        }
    },
    async getQRCode(req, res) {
        try {
            const { id } = req.params;
            const result = await (0, database_1.query)(`SELECT r.*, e.name as event_name, e.date, e.venue, e.start_time,
                v.vehicle_number, v.model, v.vehicle_type, v.color,
                pz.name as zone_name, pz.entry_gate, pz.exit_gate
         FROM reservations r
         LEFT JOIN events e ON e.id=r.event_id
         JOIN vehicles v ON v.id=r.vehicle_id
         LEFT JOIN parking_zones pz ON pz.id=r.parking_zone_id
         WHERE r.id=? AND r.customer_id=?`, [id, req.user.userId]);
            if (!result.rows[0]) {
                res.status(404).json({ error: 'Reservation not found' });
                return;
            }
            const r = result.rows[0];
            const qrDataUrl = await qrService_1.qrService.generateQRDataUrl(r.qr_token);
            res.json({ reservation: r, qrCode: qrDataUrl });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to generate QR' });
        }
    },
    async verifyQR(req, res) {
        try {
            const { token, action } = req.body;
            if (!token) {
                res.status(400).json({ error: 'Token required' });
                return;
            }
            const result = await (0, database_1.query)(`SELECT r.*, e.name as event_name, e.date,
                v.vehicle_number, v.model, v.color,
                pz.name as zone_name, pz.entry_gate, pz.exit_gate,
                u.name as customer_name
         FROM reservations r
         LEFT JOIN events e ON e.id=r.event_id
         JOIN vehicles v ON v.id=r.vehicle_id
         LEFT JOIN parking_zones pz ON pz.id=r.parking_zone_id
         JOIN users u ON u.id=r.customer_id
         WHERE r.qr_token=?`, [token]);
            if (!result.rows[0]) {
                res.status(404).json({ valid: false, error: 'Invalid QR code' });
                return;
            }
            const r = result.rows[0];
            if (r.status === 'CANCELLED') {
                res.status(400).json({ valid: false, error: 'Reservation cancelled' });
                return;
            }
            if (r.status === 'EXPIRED') {
                res.status(400).json({ valid: false, error: 'Reservation expired' });
                return;
            }
            if (action === 'CHECKIN') {
                if (r.status === 'CHECKED_IN' || r.status === 'CHECKED_OUT') {
                    res.status(400).json({ valid: false, error: 'Already processed' });
                    return;
                }
                await (0, database_1.query)("UPDATE reservations SET status='CHECKED_IN', check_in_time=CURRENT_TIMESTAMP WHERE id=?", [r.id]);
                if (r.parking_zone_id) {
                    await parkingService_1.parkingService.updateOccupancy(r.parking_zone_id, 1);
                }
                await auditService_1.auditService.log(req.user.userId, 'CHECK_IN', `Checked in: ${r.reservation_code}`);
                res.json({ valid: true, action: 'CHECKED_IN', reservation: r });
            }
            else if (action === 'CHECKOUT') {
                if (r.status !== 'CHECKED_IN') {
                    res.status(400).json({ valid: false, error: 'Not checked in' });
                    return;
                }
                await (0, database_1.query)("UPDATE reservations SET status='CHECKED_OUT', check_out_time=CURRENT_TIMESTAMP WHERE id=?", [r.id]);
                if (r.parking_zone_id) {
                    await parkingService_1.parkingService.updateOccupancy(r.parking_zone_id, -1);
                }
                await auditService_1.auditService.log(req.user.userId, 'CHECK_OUT', `Checked out: ${r.reservation_code}`);
                // ── Overstay fine calculation ──────────────────────────────────────────
                const bookingEnd = r.booking_end;
                const checkoutTime = new Date();
                if (bookingEnd) {
                    const [h, m] = bookingEnd.split(':').map(Number);
                    const today = new Date();
                    const endDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m, 0);
                    const overstayMs = checkoutTime.getTime() - endDateTime.getTime();
                    if (overstayMs > 0) {
                        const hoursOverstayed = overstayMs / (1000 * 60 * 60);
                        const settingRes = await (0, database_1.query)("SELECT value FROM system_settings WHERE key='overstay_fine_per_hour'", []);
                        const ratePerHour = parseFloat(settingRes.rows[0]?.value || '100');
                        const fineAmount = Math.ceil(hoursOverstayed * ratePerHour);
                        const fineId = makeId();
                        await (0, database_1.query)("INSERT INTO fines (id, reservation_id, customer_id, amount, hours_overstayed, reason, status) VALUES (?, ?, ?, ?, ?, ?, 'UNPAID')", [
                            fineId, r.id, r.customer_id, fineAmount,
                            Math.round(hoursOverstayed * 100) / 100,
                            `Overstay of ${Math.round(hoursOverstayed * 100) / 100} hours beyond booked end time ${bookingEnd}`,
                        ]);
                        await notificationService_1.notificationService.createNotification(r.customer_id, '⚠️ Overstay Fine Issued', `You overstayed by ${Math.round(hoursOverstayed * 100) / 100} hours. Fine: ₹${fineAmount}`, 'FINE');
                    }
                }
                // ─────────────────────────────────────────────────────────────────────
                res.json({ valid: true, action: 'CHECKED_OUT', reservation: r });
            }
            else {
                res.json({ valid: true, action: 'VERIFY', reservation: r });
            }
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Verification failed' });
        }
    },
    async getEventReservations(req, res) {
        try {
            const { eventId } = req.params;
            const result = await (0, database_1.query)(`SELECT r.*, u.name as customer_name, v.vehicle_number, v.model, v.vehicle_type, pz.name as zone_name
         FROM reservations r
         JOIN users u ON u.id=r.customer_id
         JOIN vehicles v ON v.id=r.vehicle_id
         LEFT JOIN parking_zones pz ON pz.id=r.parking_zone_id
         WHERE r.event_id=? ORDER BY r.reserved_at DESC`, [eventId]);
            res.json(result.rows);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to get reservations' });
        }
    }
};
//# sourceMappingURL=reservationController.js.map