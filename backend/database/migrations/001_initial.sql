-- Evetramasy Database Schema (SQLite Version)
-- Migration 001: Initial Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'CUSTOMER')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  manager_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'OTHER',
  description TEXT,
  image_url TEXT,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  venue TEXT NOT NULL,
  address TEXT,
  latitude REAL DEFAULT 13.0827,
  longitude REAL DEFAULT 80.2707,
  expected_attendees INTEGER DEFAULT 0,
  expected_vehicle_percentage REAL DEFAULT 30,
  estimated_vehicle_count INTEGER DEFAULT 0,
  traffic_risk_score INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','ACTIVE','COMPLETED','CANCELLED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('CAR', 'BIKE', 'SUV', 'BUS', 'OTHER')),
  vehicle_number TEXT UNIQUE NOT NULL,
  model TEXT NOT NULL,
  color TEXT NOT NULL
);

-- Parking Zones table
CREATE TABLE IF NOT EXISTS parking_zones (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  capacity INTEGER NOT NULL DEFAULT 0,
  reserved_count INTEGER NOT NULL DEFAULT 0,
  occupied_count INTEGER NOT NULL DEFAULT 0,
  available_spaces INTEGER NOT NULL DEFAULT 0,
  entry_gate TEXT,
  exit_gate TEXT,
  latitude REAL,
  longitude REAL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','NEARLY_FULL','CRITICAL','FULL'))
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  parking_zone_id TEXT NOT NULL REFERENCES parking_zones(id) ON DELETE CASCADE,
  reservation_code TEXT UNIQUE NOT NULL,
  qr_token TEXT UNIQUE NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  status TEXT NOT NULL DEFAULT 'RESERVED' CHECK (status IN ('RESERVED','CHECKED_IN','CHECKED_OUT','CANCELLED','EXPIRED')),
  reserved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  check_in_time DATETIME,
  check_out_time DATETIME
);

-- Traffic Zones table
CREATE TABLE IF NOT EXISTS traffic_zones (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  road_name TEXT NOT NULL,
  traffic_status TEXT NOT NULL DEFAULT 'LOW' CHECK (traffic_status IN ('LOW','MODERATE','HIGH','SEVERE')),
  traffic_score INTEGER NOT NULL DEFAULT 15 CHECK (traffic_score >= 0 AND traffic_score <= 100),
  description TEXT,
  affected_gate TEXT,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Gates table
CREATE TABLE IF NOT EXISTS gates (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'ENTRY' CHECK (type IN ('ENTRY','EXIT','BOTH')),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','BUSY','CONGESTED','CLOSED')),
  queue_length INTEGER DEFAULT 0,
  estimated_wait_time INTEGER DEFAULT 0
);

-- Event Updates / Announcements table
CREATE TABLE IF NOT EXISTS event_updates (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  manager_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'INFO',
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Traffic Alerts table
CREATE TABLE IF NOT EXISTS traffic_alerts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  road_id TEXT REFERENCES traffic_zones(id) ON DELETE SET NULL,
  severity TEXT NOT NULL DEFAULT 'MODERATE',
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME
);

-- Demand Forecasts table
CREATE TABLE IF NOT EXISTS demand_forecasts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  predicted_vehicle_count INTEGER,
  predicted_parking_utilization REAL,
  predicted_traffic_score INTEGER
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  description TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_manager ON events(manager_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_event ON reservations(event_id);
CREATE INDEX IF NOT EXISTS idx_reservations_token ON reservations(qr_token);
CREATE INDEX IF NOT EXISTS idx_parking_event ON parking_zones(event_id);
CREATE INDEX IF NOT EXISTS idx_traffic_event ON traffic_zones(event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
