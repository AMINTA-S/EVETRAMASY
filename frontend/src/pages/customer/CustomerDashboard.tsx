import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reservationsAPI, vehiclesAPI, finesAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Car, Ticket, Navigation, Bell, CalendarClock, MapPin, AlertCircle } from 'lucide-react';
import { formatDate, formatTime, getTrafficRiskLevel, timeAgo } from '../../utils/helpers';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [fines, setFines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/customer/dashboard' },
    { icon: Ticket, label: 'My Reservations', path: '/customer/reservations' },
    { icon: Car, label: 'My Vehicles', path: '/customer/vehicles' },
    { icon: Navigation, label: 'Live Travel & Routes', path: '/customer/travel' },
    { icon: AlertCircle, label: 'My Fines', path: '/customer/fines' },
    { icon: Bell, label: 'Notifications', path: '/customer/notifications' },
  ];

  useEffect(() => {
    Promise.all([
      reservationsAPI.getMy(),
      vehiclesAPI.getAll(),
      finesAPI.getMy()
    ]).then(([r, v, f]) => {
      setReservations(r.data);
      setVehicles(v.data);
      setFines(f.data);
    })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeReservations = reservations.filter(r => r.status === 'RESERVED' || r.status === 'CHECKED_IN');

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="CUSTOMER" />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Welcome, {user?.name.split(' ')[0]} 👋</h1>
            <p className="page-subtitle">Here is your upcoming event parking and travel overview.</p>
          </div>
          <button className="btn btn-primary" onClick={() => window.location.href = '/events'}>
            Browse Events
          </button>
        </div>
        <div className="page-body">
          {loading ? (
            <div className="loading-center"><div className="loading-spinner" /></div>
          ) : (
            <>
              <div className="grid-3 mb-6">
                <div className="stat-card">
                  <div className="stat-label">Active Reservations</div>
                  <div className="stat-value">{activeReservations.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Vehicles</div>
                  <div className="stat-value">--</div> {/* Would need a vehicles call here if we wanted to show it */}
                </div>
                <div className="stat-card">
                  <div className="stat-label">Status</div>
                  <div className="stat-value" style={{ color: 'var(--accent-green)', fontSize: 24 }}>Ready to Go</div>
                </div>
              </div>

              <h2 style={{ fontSize: 20, marginBottom: 16 }}>Your Upcoming Event</h2>
              {activeReservations.length > 0 ? (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ background: 'var(--gradient-accent)', padding: '20px 24px' }}>
                    <div className="badge" style={{ background: 'rgba(0,0,0,0.2)', color: '#fff', border: 'none', marginBottom: 12 }}>UPCOMING</div>
                    <h3 style={{ fontSize: 24, color: '#fff' }}>{activeReservations[0].event_name}</h3>
                  </div>
                  <div style={{ padding: 24, display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div className="flex items-center gap-2 mb-4 text-muted"><CalendarClock size={16}/> {formatDate(activeReservations[0].date)} at {formatTime(activeReservations[0].start_time)}</div>
                      <div className="flex items-center gap-2 mb-4 text-muted"><MapPin size={16}/> {activeReservations[0].venue}</div>
                      <div className="flex items-center gap-2 mb-4 text-muted"><Car size={16}/> {activeReservations[0].vehicle_number} ({activeReservations[0].model})</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Reserved Parking Zone</div>
                      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{activeReservations[0].zone_name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Entry Gate</div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{activeReservations[0].entry_gate}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <Ticket size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Upcoming Events</div>
                  <p style={{ marginBottom: 24 }}>You don't have any active parking reservations.</p>
                  <button className="btn btn-primary" onClick={() => window.location.href = '/events'} style={{ margin: '0 auto' }}>
                    Browse Events
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
