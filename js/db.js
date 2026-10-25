/**
 * EVETRAMASY — Data Layer (localStorage simulation)
 * Handles all CRUD operations for every entity in the system.
 */

const DB = (() => {

  // ─── Seed Demo Data ───────────────────────────────────────────────────────
  function seed() {
    if (localStorage.getItem('evetramasy_seeded')) return;

    const users = [
      { id: 'u1', username: 'alice', email: 'alice@demo.com', password: 'alice123', name: 'Alice Johnson', phone: '9876543210', role: 'customer',      avatar: '', createdAt: new Date('2024-01-10').toISOString() },
      { id: 'u2', username: 'bob',   email: 'bob@demo.com',   password: 'bob123',   name: 'Bob Kumar',    phone: '9876543211', role: 'organiser',     avatar: '', createdAt: new Date('2024-01-11').toISOString() },
      { id: 'u3', username: 'carol', email: 'carol@demo.com', password: 'carol123', name: 'Carol Sharma', phone: '9876543212', role: 'parking_owner', avatar: '', createdAt: new Date('2024-01-12').toISOString() },
    ];

    const parkingLots = [
      {
        id: 'pl1', ownerId: 'u3',
        name: 'Sharma Parking Complex',
        address: 'No.12, Anna Salai, Chennai',
        lat: 13.0604, lng: 80.2496,
        totalSpaces: 120, availableSpaces: 85,
        pricePerHour: 30,
        type: 'Multi-Storey',
        amenities: ['CCTV', 'Security Guard', '24/7', 'EV Charging'],
        description: 'Premium multi-storey parking in the heart of Chennai.',
        status: 'active',
        operatingHours: '24/7',
        rating: 4.3, reviewCount: 18,
        createdAt: new Date('2024-01-12').toISOString()
      },
      {
        id: 'pl2', ownerId: 'u3',
        name: 'City Centre Open Lot',
        address: 'Egmore, Chennai',
        lat: 13.0756, lng: 80.2607,
        totalSpaces: 60, availableSpaces: 22,
        pricePerHour: 15,
        type: 'Surface',
        amenities: ['CCTV', 'Security Guard'],
        description: 'Affordable open surface parking near Egmore station.',
        status: 'active',
        operatingHours: '6 AM – 11 PM',
        rating: 3.8, reviewCount: 9,
        createdAt: new Date('2024-01-13').toISOString()
      }
    ];

    const events = [
      {
        id: 'ev1', organiserId: 'u2',
        name: 'Chennai Super Kings vs Mumbai Indians',
        venue: 'MA Chidambaram Stadium',
        address: 'Chepauk, Chennai',
        lat: 13.0628, lng: 80.2791,
        date: '2024-12-15',
        startTime: '19:00', endTime: '23:00',
        expectedVisitors: 50000,
        description: 'IPL match — gates open at 5 PM.',
        eventType: 'Cricket Match',
        status: 'upcoming',
        approvedParkingLots: ['pl1'],
        gates: [
          { id: 'g1', name: 'Gate A — North', lat: 13.0635, lng: 80.2785, queue: 12 },
          { id: 'g2', name: 'Gate B — South', lat: 13.0620, lng: 80.2798, queue: 4 }
        ],
        emergencyLane: false,
        createdAt: new Date('2024-11-01').toISOString()
      }
    ];

    const applications = [
      {
        id: 'app1', lotId: 'pl2', ownerId: 'u3',
        eventId: 'ev1', organiserId: 'u2',
        message: 'Our lot is 800m from the stadium with 60 spaces available for the match day.',
        status: 'pending',
        createdAt: new Date('2024-11-05').toISOString(),
        respondedAt: null
      }
    ];

    const bookings = [
      {
        id: 'bk1', customerId: 'u1', lotId: 'pl1', eventId: 'ev1',
        vehicleNumber: 'TN01AB1234', vehicleType: 'Car',
        startTime: '2024-12-15T17:00', endTime: '2024-12-15T23:00',
        duration: 6, totalAmount: 180,
        status: 'active',
        qrCode: 'EVETRAMASY-BK1-TN01AB1234',
        createdAt: new Date('2024-11-10').toISOString()
      }
    ];

    const notifications = [
      { id: 'n1', userId: 'u2', message: 'Carol Sharma sent a parking application for "CSK vs MI".', type: 'application', read: false, createdAt: new Date().toISOString() },
      { id: 'n2', userId: 'u3', message: 'Your parking lot "Sharma Parking Complex" has been booked by Alice Johnson.', type: 'booking', read: false, createdAt: new Date().toISOString() },
      { id: 'n3', userId: 'u1', message: 'Your booking for CSK vs MI is confirmed! Show QR at entry.', type: 'booking', read: false, createdAt: new Date().toISOString() },
    ];

    const reviews = [];

    // ── Seed IoT Bay Sensors for Parking Lots ──
    const sensors = [
      // Sharma Parking Complex (pl1)
      { id: 's_pl1_01', lotId: 'pl1', slotCode: 'A-01', floor: 'Ground', type: 'Ultrasonic Node', status: 'occupied', batteryLevel: 96, signalRssi: -58, hardwareId: 'IOT-US-101', vehiclePlate: 'TN01AB1234', lastHeartbeat: new Date().toISOString() },
      { id: 's_pl1_02', lotId: 'pl1', slotCode: 'A-02', floor: 'Ground', type: 'Ultrasonic Node', status: 'vacant',   batteryLevel: 98, signalRssi: -54, hardwareId: 'IOT-US-102', vehiclePlate: null,         lastHeartbeat: new Date().toISOString() },
      { id: 's_pl1_03', lotId: 'pl1', slotCode: 'A-03', floor: 'Ground', type: 'Ultrasonic Node', status: 'vacant',   batteryLevel: 94, signalRssi: -60, hardwareId: 'IOT-US-103', vehiclePlate: null,         lastHeartbeat: new Date().toISOString() },
      { id: 's_pl1_04', lotId: 'pl1', slotCode: 'A-04', floor: 'Ground', type: 'Ultrasonic Node', status: 'occupied', batteryLevel: 91, signalRssi: -65, hardwareId: 'IOT-US-104', vehiclePlate: 'TN09CD5544', lastHeartbeat: new Date().toISOString() },
      { id: 's_pl1_05', lotId: 'pl1', slotCode: 'A-05', floor: 'Ground', type: 'Ultrasonic Node', status: 'vacant',   batteryLevel: 99, signalRssi: -52, hardwareId: 'IOT-US-105', vehiclePlate: null,         lastHeartbeat: new Date().toISOString() },
      { id: 's_pl1_06', lotId: 'pl1', slotCode: 'A-06', floor: 'Ground', type: 'Geomagnetic Puck', status: 'vacant', batteryLevel: 88, signalRssi: -62, hardwareId: 'IOT-GM-106', vehiclePlate: null,         lastHeartbeat: new Date().toISOString() },
      { id: 's_pl1_07', lotId: 'pl1', slotCode: 'A-07', floor: 'Ground', type: 'Geomagnetic Puck', status: 'occupied', batteryLevel: 92, signalRssi: -59, hardwareId: 'IOT-GM-107', vehiclePlate: 'KA03EE9901', lastHeartbeat: new Date().toISOString() },
      { id: 's_pl1_08', lotId: 'pl1', slotCode: 'A-08', floor: 'Ground', type: 'Geomagnetic Puck', status: 'vacant', batteryLevel: 95, signalRssi: -55, hardwareId: 'IOT-GM-108', vehiclePlate: null,         lastHeartbeat: new Date().toISOString() },
      { id: 's_pl1_09', lotId: 'pl1', slotCode: 'B-01', floor: 'Level 1', type: 'Ultrasonic Node', status: 'vacant', batteryLevel: 97, signalRssi: -50, hardwareId: 'IOT-US-201', vehiclePlate: null,         lastHeartbeat: new Date().toISOString() },
      { id: 's_pl1_10', lotId: 'pl1', slotCode: 'B-02', floor: 'Level 1', type: 'Ultrasonic Node', status: 'occupied', batteryLevel: 89, signalRssi: -68, hardwareId: 'IOT-US-202', vehiclePlate: 'TN07ZZ4321', lastHeartbeat: new Date().toISOString() },
      { id: 's_pl1_11', lotId: 'pl1', slotCode: 'B-03', floor: 'Level 1', type: 'Ultrasonic Node', status: 'vacant', batteryLevel: 95, signalRssi: -53, hardwareId: 'IOT-US-203', vehiclePlate: null,         lastHeartbeat: new Date().toISOString() },
      { id: 's_pl1_12', lotId: 'pl1', slotCode: 'B-04', floor: 'Level 1', type: 'Ultrasonic Node', status: 'vacant', batteryLevel: 93, signalRssi: -57, hardwareId: 'IOT-US-204', vehiclePlate: null,         lastHeartbeat: new Date().toISOString() },
      { id: 's_pl1_13', lotId: 'pl1', slotCode: 'EV-01', floor: 'Ground', type: 'Optical Camera Node', status: 'occupied', batteryLevel: 100, signalRssi: -45, hardwareId: 'IOT-CAM-301', vehiclePlate: 'TN10EV0001', lastHeartbeat: new Date().toISOString() },
      { id: 's_pl1_14', lotId: 'pl1', slotCode: 'EV-02', floor: 'Ground', type: 'Optical Camera Node', status: 'vacant', batteryLevel: 100, signalRssi: -47, hardwareId: 'IOT-CAM-302', vehiclePlate: null, lastHeartbeat: new Date().toISOString() },

      // City Centre Open Lot (pl2)
      { id: 's_pl2_01', lotId: 'pl2', slotCode: 'G-01', floor: 'Surface', type: 'Geomagnetic Puck', status: 'occupied', batteryLevel: 94, signalRssi: -62, hardwareId: 'IOT-GM-401', vehiclePlate: 'TN02KL9912', lastHeartbeat: new Date().toISOString() },
      { id: 's_pl2_02', lotId: 'pl2', slotCode: 'G-02', floor: 'Surface', type: 'Geomagnetic Puck', status: 'vacant',   batteryLevel: 97, signalRssi: -55, hardwareId: 'IOT-GM-402', vehiclePlate: null,         lastHeartbeat: new Date().toISOString() },
      { id: 's_pl2_03', lotId: 'pl2', slotCode: 'G-03', floor: 'Surface', type: 'Geomagnetic Puck', status: 'occupied', batteryLevel: 88, signalRssi: -70, hardwareId: 'IOT-GM-403', vehiclePlate: 'TN05RR1109', lastHeartbeat: new Date().toISOString() },
      { id: 's_pl2_04', lotId: 'pl2', slotCode: 'G-04', floor: 'Surface', type: 'Geomagnetic Puck', status: 'vacant',   batteryLevel: 96, signalRssi: -58, hardwareId: 'IOT-GM-404', vehiclePlate: null,         lastHeartbeat: new Date().toISOString() },
      { id: 's_pl2_05', lotId: 'pl2', slotCode: 'G-05', floor: 'Surface', type: 'Geomagnetic Puck', status: 'vacant',   batteryLevel: 92, signalRssi: -64, hardwareId: 'IOT-GM-405', vehiclePlate: null,         lastHeartbeat: new Date().toISOString() },
      { id: 's_pl2_06', lotId: 'pl2', slotCode: 'G-06', floor: 'Surface', type: 'Geomagnetic Puck', status: 'occupied', batteryLevel: 85, signalRssi: -72, hardwareId: 'IOT-GM-406', vehiclePlate: 'TN01PQ7788', lastHeartbeat: new Date().toISOString() },
      { id: 's_pl2_07', lotId: 'pl2', slotCode: 'G-07', floor: 'Surface', type: 'Geomagnetic Puck', status: 'vacant',   batteryLevel: 99, signalRssi: -51, hardwareId: 'IOT-GM-407', vehiclePlate: null,         lastHeartbeat: new Date().toISOString() },
      { id: 's_pl2_08', lotId: 'pl2', slotCode: 'G-08', floor: 'Surface', type: 'Geomagnetic Puck', status: 'vacant',   batteryLevel: 95, signalRssi: -56, hardwareId: 'IOT-GM-408', vehiclePlate: null,         lastHeartbeat: new Date().toISOString() },
    ];

    _set('users', users);
    _set('parkingLots', parkingLots);
    _set('events', events);
    _set('applications', applications);
    _set('bookings', bookings);
    _set('notifications', notifications);
    _set('reviews', reviews);
    _set('sensors', sensors);
    _set('vehicles', [
      {
        id: 'veh_demo_01',
        userId: 'u1',
        plateNumber: 'TN 01 AB 1234',
        vehicleType: 'Car',
        makeModel: 'Hyundai Creta 1.5 SX',
        fuelType: 'Petrol',
        color: 'Polar White',
        fastagId: 'NETC-FASTAG-982104',
        isDefault: true,
        createdAt: new Date('2024-02-01').toISOString()
      },
      {
        id: 'veh_demo_02',
        userId: 'u1',
        plateNumber: 'TN 09 CD 5544',
        vehicleType: 'Two-Wheeler',
        makeModel: 'Ather 450X Gen 3',
        fuelType: 'Electric',
        color: 'Space Grey',
        fastagId: '',
        isDefault: false,
        createdAt: new Date('2024-03-15').toISOString()
      }
    ]);
    localStorage.setItem('evetramasy_seeded', '1');
  }

  // ─── Storage Helpers ──────────────────────────────────────────────────────
  function _key(entity)      { return `evetramasy_${entity}`; }
  function _get(entity)      { return JSON.parse(localStorage.getItem(_key(entity)) || '[]'); }
  function _set(entity, arr) { localStorage.setItem(_key(entity), JSON.stringify(arr)); }
  function _uid()            { return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(); }

  // ─── USERS ────────────────────────────────────────────────────────────────
  const Users = {
    all:         ()       => _get('users'),
    find:        (id)     => _get('users').find(u => u.id === id),
    findByUsername: (u)   => _get('users').find(x => x.username === u),
    findByEmail: (email)  => _get('users').find(u => u.email === email),

    create(data) {
      const users = _get('users');
      if (users.find(u => u.username === data.username)) return { error: 'Username already taken.' };
      if (users.find(u => u.email === data.email))       return { error: 'Email already registered.' };
      const user = { id: _uid(), ...data, avatar: '', createdAt: new Date().toISOString() };
      users.push(user);
      _set('users', users);
      return { user };
    },

    update(id, data) {
      const users = _get('users').map(u => u.id === id ? { ...u, ...data } : u);
      _set('users', users);
      return users.find(u => u.id === id);
    },

    resetPassword(username, newPassword) {
      const users = _get('users');
      const idx = users.findIndex(u => u.username === username);
      if (idx === -1) return false;
      users[idx].password = newPassword;
      _set('users', users);
      return true;
    }
  };

  // ─── PARKING LOTS ─────────────────────────────────────────────────────────
  const ParkingLots = {
    all:         ()     => _get('parkingLots'),
    find:        (id)   => _get('parkingLots').find(p => p.id === id),
    byOwner:     (uid)  => _get('parkingLots').filter(p => p.ownerId === uid),
    active:      ()     => _get('parkingLots').filter(p => p.status === 'active'),

    create(data) {
      const lots = _get('parkingLots');
      const lot = { id: _uid(), ...data, availableSpaces: data.totalSpaces, rating: 0, reviewCount: 0, createdAt: new Date().toISOString() };
      lots.push(lot);
      _set('parkingLots', lots);
      return lot;
    },

    update(id, data) {
      const lots = _get('parkingLots').map(p => p.id === id ? { ...p, ...data } : p);
      _set('parkingLots', lots);
      return lots.find(p => p.id === id);
    },

    delete(id) {
      _set('parkingLots', _get('parkingLots').filter(p => p.id !== id));
    },

    updateSpaces(id, delta) {
      const lots = _get('parkingLots');
      const idx = lots.findIndex(p => p.id === id);
      if (idx === -1) return;
      lots[idx].availableSpaces = Math.max(0, Math.min(lots[idx].totalSpaces, lots[idx].availableSpaces + delta));
      _set('parkingLots', lots);
    }
  };

  // ─── EVENTS ───────────────────────────────────────────────────────────────
  const Events = {
    all:          ()      => _get('events'),
    find:         (id)    => _get('events').find(e => e.id === id),
    byOrganiser:  (uid)   => _get('events').filter(e => e.organiserId === uid),
    upcoming:     ()      => _get('events').filter(e => e.status === 'upcoming'),

    create(data) {
      const events = _get('events');
      const event = { id: _uid(), ...data, approvedParkingLots: [], emergencyLane: false, createdAt: new Date().toISOString() };
      events.push(event);
      _set('events', events);
      return event;
    },

    update(id, data) {
      const events = _get('events').map(e => e.id === id ? { ...e, ...data } : e);
      _set('events', events);
      return events.find(e => e.id === id);
    },

    approveLot(eventId, lotId) {
      const events = _get('events');
      const idx = events.findIndex(e => e.id === eventId);
      if (idx === -1) return;
      if (!events[idx].approvedParkingLots.includes(lotId)) {
        events[idx].approvedParkingLots.push(lotId);
        _set('events', events);
      }
    },

    removeLot(eventId, lotId) {
      const events = _get('events');
      const idx = events.findIndex(e => e.id === eventId);
      if (idx === -1) return;
      events[idx].approvedParkingLots = events[idx].approvedParkingLots.filter(id => id !== lotId);
      _set('events', events);
    },

    delete(id) {
      _set('events', _get('events').filter(e => e.id !== id));
    }
  };

  // ─── APPLICATIONS ─────────────────────────────────────────────────────────
  const Applications = {
    all:           ()       => _get('applications'),
    find:          (id)     => _get('applications').find(a => a.id === id),
    byOwner:       (uid)    => _get('applications').filter(a => a.ownerId === uid),
    byOrganiser:   (uid)    => _get('applications').filter(a => a.organiserId === uid),
    byEvent:       (evid)   => _get('applications').filter(a => a.eventId === evid),
    byLot:         (lotId)  => _get('applications').filter(a => a.lotId === lotId),

    create(data) {
      const apps = _get('applications');
      // Prevent duplicate applications for same lot+event
      const exists = apps.find(a => a.lotId === data.lotId && a.eventId === data.eventId);
      if (exists) return { error: 'You have already applied for this event with this lot.' };
      const app = { id: _uid(), ...data, status: 'pending', createdAt: new Date().toISOString(), respondedAt: null };
      apps.push(app);
      _set('applications', apps);
      return { app };
    },

    respond(id, status) {
      const apps = _get('applications').map(a =>
        a.id === id ? { ...a, status, respondedAt: new Date().toISOString() } : a
      );
      _set('applications', apps);
      const app = apps.find(a => a.id === id);
      if (status === 'accepted') Events.approveLot(app.eventId, app.lotId);
      if (status === 'declined') Events.removeLot(app.eventId, app.lotId);
      return app;
    }
  };

  // ─── BOOKINGS ─────────────────────────────────────────────────────────────
  const Bookings = {
    all:         ()     => _get('bookings'),
    find:        (id)   => _get('bookings').find(b => b.id === id),
    byCustomer:  (uid)  => _get('bookings').filter(b => b.customerId === uid),
    byLot:       (lid)  => _get('bookings').filter(b => b.lotId === lid),
    byEvent:     (eid)  => _get('bookings').filter(b => b.eventId === eid),

    create(data) {
      const bookings = _get('bookings');
      const id = _uid();
      const booking = {
        id,
        ...data,
        status: 'active',
        qrCode: `EVETRAMASY-${id}-${data.vehicleNumber}`,
        createdAt: new Date().toISOString()
      };
      bookings.push(booking);
      _set('bookings', bookings);
      ParkingLots.updateSpaces(data.lotId, -1);
      return booking;
    },

    cancel(id) {
      const bookings = _get('bookings');
      const idx = bookings.findIndex(b => b.id === id);
      if (idx === -1) return false;
      bookings[idx].status = 'cancelled';
      _set('bookings', bookings);
      ParkingLots.updateSpaces(bookings[idx].lotId, 1);
      return true;
    },

    complete(id) {
      const bookings = _get('bookings').map(b => b.id === id ? { ...b, status: 'completed' } : b);
      _set('bookings', bookings);
    }
  };

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────────
  const Notifications = {
    forUser:    (uid)  => _get('notifications').filter(n => n.userId === uid).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)),
    unreadCount:(uid)  => _get('notifications').filter(n => n.userId === uid && !n.read).length,

    push(userId, message, type = 'info') {
      const notes = _get('notifications');
      notes.push({ id: _uid(), userId, message, type, read: false, createdAt: new Date().toISOString() });
      _set('notifications', notes);
    },

    markRead(id) {
      const notes = _get('notifications').map(n => n.id === id ? { ...n, read: true } : n);
      _set('notifications', notes);
    },

    markAllRead(uid) {
      const notes = _get('notifications').map(n => n.userId === uid ? { ...n, read: true } : n);
      _set('notifications', notes);
    }
  };

  // ─── REVIEWS ─────────────────────────────────────────────────────────────
  const Reviews = {
    all:      ()      => _get('reviews'),
    byLot:    (lid)   => _get('reviews').filter(r => r.lotId === lid),
    byCustomer:(uid)  => _get('reviews').filter(r => r.customerId === uid),

    create(data) {
      const reviews = _get('reviews');
      const review = { id: _uid(), ...data, createdAt: new Date().toISOString() };
      reviews.push(review);
      _set('reviews', reviews);
      // Update lot rating
      const lotReviews = reviews.filter(r => r.lotId === data.lotId);
      const avg = lotReviews.reduce((s, r) => s + r.rating, 0) / lotReviews.length;
      ParkingLots.update(data.lotId, { rating: Math.round(avg * 10) / 10, reviewCount: lotReviews.length });
      return review;
    }
  };

  // ─── IOT SENSORS ──────────────────────────────────────────────────────────
  const Sensors = {
    all:       ()        => _get('sensors'),
    byLot:     (lotId)   => _get('sensors').filter(s => s.lotId === lotId),
    find:      (id)      => _get('sensors').find(s => s.id === id),

    create(data) {
      const sensors = _get('sensors');
      const sensor = {
        id: _uid(),
        batteryLevel: 98,
        signalRssi: -55,
        status: 'vacant',
        vehiclePlate: null,
        lastHeartbeat: new Date().toISOString(),
        ...data
      };
      sensors.push(sensor);
      _set('sensors', sensors);
      this.syncLotAvailability(sensor.lotId);
      return sensor;
    },

    update(id, data) {
      const sensors = _get('sensors').map(s => s.id === id ? { ...s, ...data, lastHeartbeat: new Date().toISOString() } : s);
      _set('sensors', sensors);
      const updated = sensors.find(s => s.id === id);
      if (updated) this.syncLotAvailability(updated.lotId);
      return updated;
    },

    delete(id) {
      const target = this.find(id);
      _set('sensors', _get('sensors').filter(s => s.id !== id));
      if (target) this.syncLotAvailability(target.lotId);
    },

    toggleStatus(id, vehiclePlate = null) {
      const sensors = _get('sensors');
      const idx = sensors.findIndex(s => s.id === id);
      if (idx === -1) return null;
      const wasVacant = sensors[idx].status === 'vacant';
      sensors[idx].status = wasVacant ? 'occupied' : 'vacant';
      sensors[idx].vehiclePlate = wasVacant ? (vehiclePlate || `TN${Math.floor(10 + Math.random() * 89)}AB${Math.floor(1000 + Math.random() * 8999)}`) : null;
      sensors[idx].lastHeartbeat = new Date().toISOString();
      _set('sensors', sensors);

      // Recalculate lot available spaces
      this.syncLotAvailability(sensors[idx].lotId);
      return sensors[idx];
    },

    syncLotAvailability(lotId) {
      const lot = ParkingLots.find(lotId);
      if (!lot) return;
      const lotSensors = this.byLot(lotId);
      if (!lotSensors.length) return;
      const occupiedSensors = lotSensors.filter(s => s.status === 'occupied').length;
      const ratio = occupiedSensors / lotSensors.length;
      const estimatedFree = Math.max(0, Math.round(lot.totalSpaces * (1 - ratio)));
      ParkingLots.update(lotId, { availableSpaces: estimatedFree });
    },

    bulkSimulate(lotId, action) {
      const sensors = _get('sensors');
      sensors.forEach(s => {
        if (s.lotId === lotId) {
          if (action === 'occupy_all') {
            s.status = 'occupied';
            s.vehiclePlate = s.vehiclePlate || 'TN09XY' + Math.floor(1000 + Math.random()*9000);
          } else if (action === 'vacate_all') {
            s.status = 'vacant';
            s.vehiclePlate = null;
          } else if (action === 'random') {
            s.status = Math.random() > 0.4 ? 'occupied' : 'vacant';
            s.vehiclePlate = s.status === 'occupied' ? ('TN01ZZ' + Math.floor(1000 + Math.random()*9000)) : null;
          }
          s.lastHeartbeat = new Date().toISOString();
        }
      });
      _set('sensors', sensors);
      this.syncLotAvailability(lotId);
    }
  };

  // ─── VEHICLES (Registered Customer Vehicles) ─────────────────────────────
  const Vehicles = {
    all: () => _get('vehicles'),

    byUser(userId) {
      const allVehicles = _get('vehicles');
      const userVehicles = allVehicles.filter(v => v.userId === userId);
      // Auto-seed sample vehicles for alice ('u1') if none exist
      if (userId === 'u1' && userVehicles.length === 0) {
        const demo = [
          {
            id: 'veh_demo_01',
            userId: 'u1',
            plateNumber: 'TN 01 AB 1234',
            vehicleType: 'Car',
            makeModel: 'Hyundai Creta 1.5 SX',
            fuelType: 'Petrol',
            color: 'Polar White',
            fastagId: 'NETC-FASTAG-982104',
            isDefault: true,
            createdAt: new Date('2024-02-01').toISOString()
          },
          {
            id: 'veh_demo_02',
            userId: 'u1',
            plateNumber: 'TN 09 CD 5544',
            vehicleType: 'Two-Wheeler',
            makeModel: 'Ather 450X Gen 3',
            fuelType: 'Electric',
            color: 'Space Grey',
            fastagId: '',
            isDefault: false,
            createdAt: new Date('2024-03-15').toISOString()
          }
        ];
        _set('vehicles', [...allVehicles, ...demo]);
        return demo;
      }
      return userVehicles;
    },

    find(id) {
      return _get('vehicles').find(v => v.id === id);
    },

    create(data) {
      const vehicles = _get('vehicles');
      const plate = (data.plateNumber || '').toUpperCase().trim();
      if (!plate) return { error: 'Registration number is required.' };

      // If setting as default, unset other defaults for this user
      if (data.isDefault) {
        vehicles.forEach(v => {
          if (v.userId === data.userId) v.isDefault = false;
        });
      } else {
        // If this is the user's first vehicle, make it default automatically
        const userVehicles = vehicles.filter(v => v.userId === data.userId);
        if (userVehicles.length === 0) data.isDefault = true;
      }

      const vehicle = {
        id: _uid(),
        userId: data.userId,
        plateNumber: plate,
        vehicleType: data.vehicleType || 'Car',
        makeModel: data.makeModel || '',
        fuelType: data.fuelType || 'Petrol',
        color: data.color || 'White',
        fastagId: (data.fastagId || '').trim(),
        isDefault: !!data.isDefault,
        createdAt: new Date().toISOString()
      };

      vehicles.push(vehicle);
      _set('vehicles', vehicles);
      return { vehicle };
    },

    update(id, data) {
      const vehicles = _get('vehicles');
      const idx = vehicles.findIndex(v => v.id === id);
      if (idx === -1) return null;

      if (data.isDefault) {
        vehicles.forEach(v => {
          if (v.userId === vehicles[idx].userId) v.isDefault = false;
        });
      }

      vehicles[idx] = { ...vehicles[idx], ...data };
      if (data.plateNumber) {
        vehicles[idx].plateNumber = data.plateNumber.toUpperCase().trim();
      }
      _set('vehicles', vehicles);
      return vehicles[idx];
    },

    delete(id) {
      const vehicles = _get('vehicles');
      const target = vehicles.find(v => v.id === id);
      const remaining = vehicles.filter(v => v.id !== id);
      // If deleted vehicle was default, make another one default
      if (target && target.isDefault && remaining.some(v => v.userId === target.userId)) {
        const next = remaining.find(v => v.userId === target.userId);
        if (next) next.isDefault = true;
      }
      _set('vehicles', remaining);
    },

    setDefault(userId, vehicleId) {
      const vehicles = _get('vehicles');
      vehicles.forEach(v => {
        if (v.userId === userId) {
          v.isDefault = (v.id === vehicleId);
        }
      });
      _set('vehicles', vehicles);
    }
  };

  // ─── CONFIGURATION (Google Maps API Key, etc.) ────────────────────────────
  const Config = {
    getGoogleMapsKey() {
      return localStorage.getItem('evetramasy_gmaps_key') || '';
    },
    setGoogleMapsKey(key) {
      localStorage.setItem('evetramasy_gmaps_key', (key || '').trim());
    }
  };

  // Public API
  return { seed, Users, ParkingLots, Events, Applications, Bookings, Notifications, Reviews, Sensors, Vehicles, Config };
})();

// Auto-seed on load
DB.seed();
