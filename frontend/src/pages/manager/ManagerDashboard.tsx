import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Calendar, QrCode, BarChart, Plus, Users, Car, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/manager/dashboard' },
    { icon: Calendar, label: 'My Events', path: '/manager/events' },
    { icon: QrCode, label: 'QR Scanner', path: '/manager/scanner' },
    { icon: BarChart, label: 'Analytics', path: '/manager/analytics' },
  ];

  useEffect(() => {
    eventsAPI.getManagerEvents().then(res => setEvents(res.data)).finally(() => setLoading(false));
  }, []);

  const activeEvents = events.filter(e => e.status === 'APPROVED' || e.status === 'ACTIVE');

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="MANAGER" />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Manager Dashboard</h1>
            <p className="page-subtitle">Welcome back, {user?.name}</p>
          </div>
          <Link to="/manager/events/create" className="btn btn-primary">
            <Plus size={18} /> Create Event
          </Link>
        </div>
        <div className="page-body">
          {loading ? (
             <div className="loading-center"><div className="loading-spinner" /></div>
          ) : (
            <>
              {user?.status === 'PENDING' && (
                <div className="alert alert-warning mb-6">
                  ⚠️ Your account is pending admin approval. You can draft events, but they won't go live until approved.
                </div>
              )}

              <div className="grid-4 mb-6">
                <div className="stat-card">
                  <div className="stat-label">Total Events</div>
                  <div className="stat-value">{events.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Active Events</div>
                  <div className="stat-value">{activeEvents.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Attendees (Expected)</div>
                  <div className="stat-value">{events.reduce((sum, e) => sum + parseInt(e.expected_attendees || '0'), 0).toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Parking Spaces</div>
                  <div className="stat-value">{events.reduce((sum, e) => sum + parseInt(e.total_parking || '0'), 0).toLocaleString()}</div>
                </div>
              </div>

              <h2 style={{ fontSize: 20, marginBottom: 16 }}>Recent Events</h2>
              {events.length === 0 ? (
                <div className="card text-center" style={{ padding: 40, color: 'var(--text-muted)' }}>
                  <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Events Yet</div>
                  <p>Create your first event to start managing traffic and parking.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Event Name</th>
                        <th>Date</th>
                        <th>Venue</th>
                        <th>Status</th>
                        <th>Parking Utilization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.slice(0, 5).map(e => {
                        let statusColor = '#94a3b8';
                        if (e.status === 'APPROVED') statusColor = '#22c55e';
                        if (e.status === 'PENDING') statusColor = '#f59e0b';
                        if (e.status === 'REJECTED') statusColor = '#ef4444';

                        const cap = parseInt(e.total_parking || '0');
                        const occ = parseInt(e.total_occupied || '0');
                        const util = cap ? Math.round((occ/cap)*100) : 0;

                        return (
                          <tr key={e.id}>
                            <td>
                              <Link to={`/manager/events/${e.id}`} style={{ fontWeight: 600, color: 'var(--accent-blue-light)' }}>
                                {e.name}
                              </Link>
                            </td>
                            <td>{formatDate(e.date)}</td>
                            <td><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14}/> {e.venue}</span></td>
                            <td>
                              <span className="badge" style={{ border: `1px solid ${statusColor}`, color: statusColor, background: `${statusColor}15` }}>
                                {e.status}
                              </span>
                            </td>
                            <td>
                              {cap > 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div className="progress-bar" style={{ width: 100 }}><div className="progress-fill" style={{ width: `${util}%`, background: 'var(--accent-blue)' }} /></div>
                                  <span style={{ fontSize: 12 }}>{util}%</span>
                                </div>
                              ) : <span className="text-muted text-sm">N/A</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
