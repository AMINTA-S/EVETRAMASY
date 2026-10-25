/**
 * Evetramasy Seed Script (SQLite version)
 * Run: npx ts-node database/seed/seed.ts
 */
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(__dirname, '../../evetramasy.sqlite');
const MIGRATION_PATH = path.join(__dirname, '../migrations/001_initial.sql');

const db = new sqlite3.Database(DB_PATH);

const run = (sql: string, params: any[] = []): Promise<sqlite3.RunResult> =>
  new Promise((resolve, reject) =>
    db.run(sql, params, function (this: sqlite3.RunResult, err: Error | null) {
      if (err) reject(err);
      else resolve(this);
    })
  );

const get = (sql: string, params: any[] = []): Promise<any> =>
  new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    })
  );

const uuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

const randCode = () =>
  'EVT-' + Math.random().toString(36).substring(2, 8).toUpperCase();

async function seed() {
  console.log('🌱 Starting Evetramasy SQLite seed...');

  // Enable foreign keys
  await run('PRAGMA foreign_keys=OFF');

  // Run migrations (split by semicolon, execute each)
  const migrationSQL = fs.readFileSync(MIGRATION_PATH, 'utf-8');
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    await run(stmt);
  }
  console.log('✅ Migrations applied');

  // Clear existing data
  const tables = [
    'audit_logs','notifications','traffic_alerts','demand_forecasts',
    'event_updates','reservations','gates','traffic_zones',
    'parking_zones','vehicles','events','users'
  ];
  for (const t of tables) await run(`DELETE FROM ${t}`);
  console.log('🗑️  Cleared existing data');

  // ─────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────
  const adminPass = await bcrypt.hash('Admin@123', 10);
  const managerPass = await bcrypt.hash('Manager@123', 10);
  const customerPass = await bcrypt.hash('Customer@123', 10);

  const adminId = uuid();
  await run(
    `INSERT INTO users (id,name,email,phone,password_hash,role,status) VALUES (?,?,?,?,?,'ADMIN','ACTIVE')`,
    [adminId,'Admin','admin@evetramasy.com','9000000001',adminPass]
  );

  const mgr1Id = uuid();
  await run(
    `INSERT INTO users (id,name,email,phone,password_hash,role,status) VALUES (?,?,?,?,?,'MANAGER','ACTIVE')`,
    [mgr1Id,'Arun Kumar','arun@manager.com','9000000002',managerPass]
  );

  const mgr2Id = uuid();
  await run(
    `INSERT INTO users (id,name,email,phone,password_hash,role,status) VALUES (?,?,?,?,?,'MANAGER','ACTIVE')`,
    [mgr2Id,'Priya Sharma','priya@manager.com','9000000003',managerPass]
  );

  const cust1Id = uuid();
  await run(
    `INSERT INTO users (id,name,email,phone,password_hash,role,status) VALUES (?,?,?,?,?,'CUSTOMER','ACTIVE')`,
    [cust1Id,'Ravi Shankar','ravi@customer.com','9000000004',customerPass]
  );

  const cust2Id = uuid();
  await run(
    `INSERT INTO users (id,name,email,phone,password_hash,role,status) VALUES (?,?,?,?,?,'CUSTOMER','ACTIVE')`,
    [cust2Id,'Deepa Menon','deepa@customer.com','9000000005',customerPass]
  );

  const cust3Id = uuid();
  await run(
    `INSERT INTO users (id,name,email,phone,password_hash,role,status) VALUES (?,?,?,?,?,'CUSTOMER','ACTIVE')`,
    [cust3Id,'Karthik Raj','karthik@customer.com','9000000006',customerPass]
  );
  console.log('✅ Users seeded');

  // ─────────────────────────────────────────
  // EVENTS
  // ─────────────────────────────────────────
  const ev1Id = uuid();
  await run(
    `INSERT INTO events (id,manager_id,name,category,description,date,start_time,end_time,venue,address,latitude,longitude,expected_attendees,expected_vehicle_percentage,estimated_vehicle_count,traffic_risk_score,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'APPROVED')`,
    [ev1Id,mgr1Id,'AR Rahman Live in Concert','CONCERT',
     'Experience the musical genius of AR Rahman live at YMCA Grounds. A night of timeless melodies.',
     '2026-09-15','18:00','23:00','YMCA Grounds, Nandanam',
     'YMCA Grounds, Nandanam, Chennai - 600035',
     13.0335,80.2435,25000,40,10000,78]
  );

  const ev2Id = uuid();
  await run(
    `INSERT INTO events (id,manager_id,name,category,description,date,start_time,end_time,venue,address,latitude,longitude,expected_attendees,expected_vehicle_percentage,estimated_vehicle_count,traffic_risk_score,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'APPROVED')`,
    [ev2Id,mgr2Id,'Chennai Super Kings vs Mumbai Indians','SPORTS',
     'IPL match between CSK and MI at the iconic MA Chidambaram Stadium. A sold-out crowd expected.',
     '2026-09-20','19:30','23:00','MA Chidambaram Stadium',
     'Victoria Crescent Road, Chennai - 600005',
     13.0624,80.2793,40000,35,14000,85]
  );

  const ev3Id = uuid();
  await run(
    `INSERT INTO events (id,manager_id,name,category,description,date,start_time,end_time,venue,address,latitude,longitude,expected_attendees,expected_vehicle_percentage,estimated_vehicle_count,traffic_risk_score,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'APPROVED')`,
    [ev3Id,mgr1Id,'Chennai Auto Expo 2026','EXHIBITION',
     'Asia\'s largest automobile exhibition. Over 200 brands showcasing the future of mobility.',
     '2026-09-25','09:00','18:00','Chennai Trade Centre',
     'Chennai Trade Centre, Nandambakkam, Chennai - 600089',
     13.0047,80.1839,15000,60,9000,55]
  );

  const ev4Id = uuid();
  await run(
    `INSERT INTO events (id,manager_id,name,category,description,date,start_time,end_time,venue,address,latitude,longitude,expected_attendees,expected_vehicle_percentage,estimated_vehicle_count,traffic_risk_score,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'APPROVED')`,
    [ev4Id,mgr2Id,'IIT Madras Shaastra 2026','FESTIVAL',
     'IIT Madras annual tech fest, the largest in Asia. Events, workshops, competitions, and exhibitions.',
     '2026-10-01','08:00','22:00','IIT Madras Campus',
     'IIT Madras, Sardar Patel Rd, Adyar, Chennai - 600036',
     12.9916,80.2336,12000,25,3000,30]
  );

  const ev5Id = uuid();
  await run(
    `INSERT INTO events (id,manager_id,name,category,description,date,start_time,end_time,venue,address,latitude,longitude,expected_attendees,expected_vehicle_percentage,estimated_vehicle_count,traffic_risk_score,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'APPROVED')`,
    [ev5Id,mgr1Id,'Tamil Nadu Global Investors Meet','CONFERENCE',
     'State government flagship investment conference. Industry leaders, policy makers and global investors.',
     '2026-10-10','09:00','18:00','Chennai Convention Centre',
     'Chennai Convention Centre, OMR, Chennai - 600119',
     12.9011,80.2311,5000,70,3500,45]
  );
  console.log('✅ Events seeded');

  // ─────────────────────────────────────────
  // PARKING ZONES
  // ─────────────────────────────────────────
  const pz = async (eventId: string, name: string, capacity: number, entry: string, exit: string, lat: number, lng: number) => {
    const id = uuid();
    await run(
      `INSERT INTO parking_zones (id,event_id,name,capacity,occupied_count,reserved_count,available_spaces,entry_gate,exit_gate,latitude,longitude,status)
       VALUES (?,?,?,?,0,0,?,?,?,?,?,'AVAILABLE')`,
      [id,eventId,name,capacity,capacity,entry,exit,lat,lng]
    );
    return id;
  };

  // Event 1 zones
  const pz1A = await pz(ev1Id,'Zone A - North Wing',800,'Gate 1','Gate 2',13.0340,80.2430);
  const pz1B = await pz(ev1Id,'Zone B - South Wing',600,'Gate 3','Gate 4',13.0330,80.2440);
  const pz1C = await pz(ev1Id,'Zone C - VIP',200,'VIP Gate','VIP Gate',13.0337,80.2425);

  // Event 2 zones
  const pz2A = await pz(ev2Id,'Zone A - East Stand',1000,'Gate A','Gate A',13.0630,80.2800);
  const pz2B = await pz(ev2Id,'Zone B - West Stand',1200,'Gate B','Gate B',13.0615,80.2785);
  const pz2C = await pz(ev2Id,'Zone C - Overflow',500,'Gate C','Gate C',13.0640,80.2810);

  // Event 3 zones
  const pz3A = await pz(ev3Id,'Parking Block P1',500,'Main Entrance','Main Exit',13.0050,80.1845);
  const pz3B = await pz(ev3Id,'Parking Block P2',700,'South Gate','South Gate',13.0040,80.1850);

  // Event 4 zones
  const pz4A = await pz(ev4Id,'Main Campus Parking',400,'Main Gate','Main Gate',12.9920,80.2340);

  // Event 5 zones
  const pz5A = await pz(ev5Id,'Convention Parking',300,'Main Entry','Main Exit',12.9015,80.2315);
  console.log('✅ Parking zones seeded');

  // ─────────────────────────────────────────
  // TRAFFIC ZONES
  // ─────────────────────────────────────────
  const tz = async (eventId: string, road: string, status: string, score: number, desc: string, gate: string) => {
    const id = uuid();
    await run(
      `INSERT INTO traffic_zones (id,event_id,road_name,traffic_status,traffic_score,description,affected_gate) VALUES (?,?,?,?,?,?,?)`,
      [id,eventId,road,status,score,desc,gate]
    );
    return id;
  };

  await tz(ev1Id,'Nandanam Signal Junction','SEVERE',82,'Heavy congestion expected from 17:00. Multiple signal failures during last event.','Gate 1');
  await tz(ev1Id,'Anna Salai (Nehru Bridge)','HIGH',68,'Moderate backlog from Guindy junction. Use Boat Club Road as alternate.','Gate 3');
  await tz(ev2Id,'Victoria Crescent Road','SEVERE',90,'Complete road closure near stadium. 2km queue expected post match.','Gate A');
  await tz(ev2Id,'NPL Road / Chetpet Flyover','HIGH',72,'Heavy traffic from Chetpet side. Prefer Rajaji Salai route.','Gate B');
  await tz(ev3Id,'Nandambakkam Junction','MODERATE',48,'Moderate slowdown expected during peak exhibition hours.','Main Entrance');
  await tz(ev4Id,'Sardar Patel Road, Adyar','LOW',20,'Light traffic expected. IIT Adyar gate is not on a major arterial.','Main Gate');
  await tz(ev5Id,'OMR Sholinganallur Toll','MODERATE',42,'Moderate toll-gate backup. Arrive 30 min early.','Main Entry');
  console.log('✅ Traffic zones seeded');

  // ─────────────────────────────────────────
  // GATES
  // ─────────────────────────────────────────
  const gt = async (eventId: string, name: string, type: string, queueLen: number, waitTime: number) => {
    const id = uuid();
    await run(
      `INSERT INTO gates (id,event_id,name,type,status,queue_length,estimated_wait_time) VALUES (?,?,?,?,?,?,?)`,
      [id,eventId,name,type,queueLen>50?'CONGESTED':queueLen>20?'BUSY':'OPEN',queueLen,waitTime]
    );
    return id;
  };

  await gt(ev1Id,'Gate 1 (Main Entry)','ENTRY',35,15);
  await gt(ev1Id,'Gate 2 (Exit)','EXIT',10,5);
  await gt(ev1Id,'Gate 3 (Side Entry)','ENTRY',20,8);
  await gt(ev1Id,'VIP Gate','BOTH',2,2);
  await gt(ev2Id,'Gate A (East)','ENTRY',80,35);
  await gt(ev2Id,'Gate B (West)','ENTRY',65,25);
  await gt(ev2Id,'Gate C (Overflow)','ENTRY',15,7);
  await gt(ev3Id,'Main Entrance','BOTH',12,5);
  await gt(ev3Id,'South Gate','ENTRY',8,3);
  await gt(ev4Id,'Main Gate','BOTH',5,2);
  await gt(ev5Id,'Main Entry','BOTH',10,4);
  console.log('✅ Gates seeded');

  // ─────────────────────────────────────────
  // VEHICLES
  // ─────────────────────────────────────────
  const veh1Id = uuid();
  await run(
    `INSERT INTO vehicles (id,customer_id,vehicle_type,vehicle_number,model,color) VALUES (?,'${cust1Id}','CAR','TN01AB1234','Hyundai i20','White')`,
    [veh1Id]
  );
  const veh2Id = uuid();
  await run(
    `INSERT INTO vehicles (id,customer_id,vehicle_type,vehicle_number,model,color) VALUES (?,'${cust2Id}','SUV','TN07CD5678','Toyota Fortuner','Black')`,
    [veh2Id]
  );
  const veh3Id = uuid();
  await run(
    `INSERT INTO vehicles (id,customer_id,vehicle_type,vehicle_number,model,color) VALUES (?,'${cust3Id}','BIKE','TN22EF9012','Royal Enfield Classic 350','Red')`,
    [veh3Id]
  );
  console.log('✅ Vehicles seeded');

  // ─────────────────────────────────────────
  // RESERVATIONS
  // ─────────────────────────────────────────
  const res1Id = uuid();
  await run(
    `INSERT INTO reservations (id,customer_id,event_id,vehicle_id,parking_zone_id,reservation_code,qr_token,status)
     VALUES (?,?,?,?,?,?,?,'RESERVED')`,
    [res1Id,cust1Id,ev1Id,veh1Id,pz1A,randCode(),uuid()]
  );
  // Update parking zone counts
  await run(`UPDATE parking_zones SET reserved_count=reserved_count+1,available_spaces=available_spaces-1 WHERE id=?`,[pz1A]);

  const res2Id = uuid();
  await run(
    `INSERT INTO reservations (id,customer_id,event_id,vehicle_id,parking_zone_id,reservation_code,qr_token,status)
     VALUES (?,?,?,?,?,?,?,'RESERVED')`,
    [res2Id,cust2Id,ev2Id,veh2Id,pz2A,randCode(),uuid()]
  );
  await run(`UPDATE parking_zones SET reserved_count=reserved_count+1,available_spaces=available_spaces-1 WHERE id=?`,[pz2A]);

  const res3Id = uuid();
  await run(
    `INSERT INTO reservations (id,customer_id,event_id,vehicle_id,parking_zone_id,reservation_code,qr_token,status)
     VALUES (?,?,?,?,?,?,?,'CHECKED_IN')`,
    [res3Id,cust3Id,ev3Id,veh3Id,pz3A,randCode(),uuid()]
  );
  await run(`UPDATE parking_zones SET occupied_count=occupied_count+1,available_spaces=available_spaces-1 WHERE id=?`,[pz3A]);
  console.log('✅ Reservations seeded');

  // ─────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────
  await run(
    `INSERT INTO notifications (id,user_id,title,message,type,is_read) VALUES (?,?,'Parking Reserved!','Your spot at Zone A - North Wing for AR Rahman Live has been confirmed. Check your QR pass.','RESERVATION',0)`,
    [uuid(),cust1Id]
  );
  await run(
    `INSERT INTO notifications (id,user_id,title,message,type,is_read) VALUES (?,?,'Traffic Alert','Severe congestion expected on Victoria Crescent Road before the CSK vs MI match. Leave 60 minutes early.','TRAFFIC_ALERT',0)`,
    [uuid(),cust2Id]
  );
  await run(
    `INSERT INTO notifications (id,user_id,title,message,type,is_read) VALUES (?,?,'Parking Reminder','Your event starts in 2 hours. Check live traffic before leaving.','INFO',1)`,
    [uuid(),cust3Id]
  );
  console.log('✅ Notifications seeded');

  // ─────────────────────────────────────────
  // AUDIT LOGS
  // ─────────────────────────────────────────
  await run(
    `INSERT INTO audit_logs (id,user_id,action,description) VALUES (?,?,'USER_LOGIN','Admin logged in from 192.168.1.1')`,
    [uuid(),adminId]
  );
  await run(
    `INSERT INTO audit_logs (id,user_id,action,description) VALUES (?,?,'EVENT_APPROVED','Admin approved event: AR Rahman Live in Concert')`,
    [uuid(),adminId]
  );
  await run(
    `INSERT INTO audit_logs (id,user_id,action,description) VALUES (?,?,'EVENT_CREATED','Manager created event: Chennai Super Kings vs Mumbai Indians')`,
    [uuid(),mgr2Id]
  );
  console.log('✅ Audit logs seeded');

  // ─────────────────────────────────────────
  // EVENT UPDATES
  // ─────────────────────────────────────────
  await run(
    `INSERT INTO event_updates (id,event_id,manager_id,title,message) VALUES (?,?,?,'Gate 2 Now Open','We have opened Gate 2 on the North Side to reduce queue wait times. Please use this gate if you are parked in Zone A.')`,
    [uuid(),ev1Id,mgr1Id]
  );
  await run(
    `INSERT INTO event_updates (id,event_id,manager_id,title,message) VALUES (?,?,?,'Parking Almost Full','Zone A is 90% full. Please use Zone B or Zone C. Follow the signs at the venue entrance.')`,
    [uuid(),ev2Id,mgr2Id]
  );
  console.log('✅ Event updates seeded');

  await run('PRAGMA foreign_keys=ON');

  console.log('\n🎉 Evetramasy database seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Demo Login Credentials:');
  console.log('  👑 Admin    → admin@evetramasy.com / Admin@123');
  console.log('  🎪 Manager  → arun@manager.com / Manager@123');
  console.log('  👤 Customer → ravi@customer.com / Customer@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  db.close();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  db.close();
  process.exit(1);
});
