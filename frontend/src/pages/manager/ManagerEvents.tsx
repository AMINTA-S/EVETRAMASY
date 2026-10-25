import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Calendar, QrCode, BarChart, Plus, Search, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate, getCategoryIcon } from '../../utils/helpers';

export default function ManagerEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/manager/dashboard' },
    { icon: Calendar, label: 'My Events', path: '/manager/events' },
    { icon: QrCode, label: 'QR Scanner', path: '/manager/scanner' },
    { icon: BarChart, label: 'Analytics', path: '/manager/analytics' },
  ];

  useEffect(() => {
    eventsAPI.getManagerEvents().then(res => setEvents(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="MANAGER" />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">My Events</h1>
            <p className="page-subtitle">Manage your events, parking zones, and traffic configurations.</p>
          </div>
          <Link to="/manager/events/create" className="btn btn-primary">
            <Plus size={18} /> Create Event
          </Link>
        </div>
        <div className="page-body">
          {loading ? (
             <div className="loading-center"><div className="loading-spinner" /></div>
          ) : events.length === 0 ? (
            <div className="card text-center" style={{ padding: 40, color: 'var(--text-muted)' }}>
              <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Events</div>
              <p>You haven't created any events yet.</p>
            </div>
          ) : (
            <div className="grid-3">
              {events.map(e => (
                <div key={e.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/manager/events/${e.id}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ fontSize: 32 }}>{getCategoryIcon(e.category)}</div>
                    <div className="badge" style={{ background: e.status === 'APPROVED' ? 'rgba(34,197,94,0.15)' : e.status === 'PENDING' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', color: e.status === 'APPROVED' ? '#22c55e' : e.status === 'PENDING' ? '#f59e0b' : '#ef4444' }}>
                      {e.status}
                    </div>
                  </div>
                  <h3 style={{ fontSize: 18, marginBottom: 8, lineHeight: 1.3 }}>{e.name}</h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>{formatDate(e.date)}</div>
                  <div className="divider" style={{ margin: '12px 0' }} />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted">Parking Spaces</span>
                    <span className="font-semibold">{parseInt(e.total_parking||'0').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-muted">Reservations</span>
                    <span className="font-semibold">{e.reservation_count}</span>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <span style={{ color: 'var(--accent-blue-light)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center' }}>Manage <ChevronRight size={14}/></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
