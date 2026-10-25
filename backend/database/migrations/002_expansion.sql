PRAGMA foreign_keys=OFF;

-- New tables
CREATE TABLE IF NOT EXISTS parking_facilities (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude REAL DEFAULT 13.0827,
  longitude REAL DEFAULT 80.2707,
  total_capacity INTEGER NOT NULL DEFAULT 0,
  occupied_count INTEGER NOT NULL DEFAULT 0,
  available_spaces INTEGER NOT NULL DEFAULT 0,
  hourly_rate REAL DEFAULT 0,
  api_key TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS facility_event_requests (
  id TEXT PRIMARY KEY,
  facility_id TEXT NOT NULL REFERENCES parking_facilities(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_capacity INTEGER NOT NULL DEFAULT 0,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fines (
  id TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  hours_overstayed REAL DEFAULT 0,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID','PAID')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT OR IGNORE INTO system_settings (key, value) VALUES ('overstay_fine_per_hour', '100');
INSERT OR IGNORE INTO system_settings (key, value) VALUES ('currency_symbol', 'INR');

-- Add new columns to reservations (SQLite supports ADD COLUMN)
ALTER TABLE reservations ADD COLUMN facility_id TEXT REFERENCES parking_facilities(id) ON DELETE SET NULL;
ALTER TABLE reservations ADD COLUMN booking_start TEXT;
ALTER TABLE reservations ADD COLUMN booking_end TEXT;
ALTER TABLE reservations ADD COLUMN parking_type TEXT DEFAULT 'EVENT';

-- Recreate users table to add PARKING_OWNER role
CREATE TABLE users_new (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'CUSTOMER', 'PARKING_OWNER')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO users_new SELECT * FROM users;
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

CREATE INDEX IF NOT EXISTS idx_facilities_owner ON parking_facilities(owner_id);
CREATE INDEX IF NOT EXISTS idx_facility_requests_event ON facility_event_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_facility_requests_facility ON facility_event_requests(facility_id);
CREATE INDEX IF NOT EXISTS idx_fines_customer ON fines(customer_id);
CREATE INDEX IF NOT EXISTS idx_fines_reservation ON fines(reservation_id);

PRAGMA foreign_keys=ON;
