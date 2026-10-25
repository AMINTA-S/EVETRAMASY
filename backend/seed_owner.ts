import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

const db = new sqlite3.Database('./evetramasy.sqlite');

async function seed() {
  const hash = await bcrypt.hash('Owner@123', 10);
  db.run(`INSERT OR IGNORE INTO users (id, name, email, password_hash, role, status) VALUES ('owner-123', 'Demo Owner', 'owner@parking.com', ?, 'PARKING_OWNER', 'ACTIVE')`, [hash], (err) => {
    if (err) console.error(err);
    else console.log('Seeded demo owner');
  });
}
seed();
