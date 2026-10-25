import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Car, Ticket, Navigation, Bell, CheckCircle2 } from 'lucide-react';
import { timeAgo } from '../../utils/helpers';

export default function CustomerNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/customer/dashboard' },
    { icon: Ticket, label: 'My Reservations', path: '/customer/reservations' },
    { icon: Car, label: 'My Vehicles', path: '/customer/vehicles' },
    { icon: Navigation, label: 'Live Travel & Routes', path: '/customer/travel' },
    { icon: Bell, label: 'Notifications', path: '/customer/notifications' },
  ];

  const fetchNotifs = () => {
    setLoading(true);
    notificationsAPI.getAll().then(res => setNotifications(res.data.notifications)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifs(); }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsAPI.markRead(id);
      fetchNotifs();
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      fetchNotifs();
    } catch {}
  };

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="CUSTOMER" />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">Alerts, updates, and reminders for your events.</p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
              <CheckCircle2 size={16} /> Mark all read
            </button>
          )}
        </div>
        <div className="page-body">
          {loading ? (
             <div className="loading-center"><div className="loading-spinner" /></div>
          ) : notifications.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <Bell size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>All caught up!</div>
              <p>You have no new notifications.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              {notifications.map((n, i) => (
                <div key={n.id} style={{ padding: 20, borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none', background: n.is_read ? 'transparent' : 'rgba(59,130,246,0.05)', display: 'flex', gap: 16, cursor: !n.is_read ? 'pointer' : 'default' }} onClick={() => !n.is_read && handleMarkRead(n.id)}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                    {n.type === 'TRAFFIC_ALERT' ? '🚨' : n.type === 'PARKING_ALERT' ? '🅿️' : n.type === 'RESERVATION' ? '✅' : '📢'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontWeight: !n.is_read ? 700 : 500, color: !n.is_read ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(n.created_at)}</div>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.message}</div>
                  </div>
                  {!n.is_read && <div className="notif-dot" style={{ alignSelf: 'center' }} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
