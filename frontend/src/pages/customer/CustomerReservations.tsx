import React, { useState, useEffect } from 'react';
import { reservationsAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Car, Ticket, Navigation, Bell, MapPin, CalendarClock, QrCode, XCircle } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/helpers';

export default function CustomerReservations() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/customer/dashboard' },
    { icon: Ticket, label: 'My Reservations', path: '/customer/reservations' },
    { icon: Car, label: 'My Vehicles', path: '/customer/vehicles' },
    { icon: Navigation, label: 'Live Travel & Routes', path: '/customer/travel' },
    { icon: Bell, label: 'Notifications', path: '/customer/notifications' },
  ];

  const fetchReservations = () => {
    setLoading(true);
    reservationsAPI.getAll().then(res => setReservations(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleShowQR = async (id: string) => {
    try {
      const res = await reservationsAPI.getQR(id);
      setSelectedQR(res.data.qrCode);
    } catch (err) { alert('Failed to load QR code'); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this reservation? This cannot be undone.')) return;
    try {
      await reservationsAPI.cancel(id);
      fetchReservations();
    } catch (err) { alert('Failed to cancel'); }
  };

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="CUSTOMER" />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">My Reservations</h1>
            <p className="page-subtitle">Manage your event parking reservations and access your QR passes.</p>
          </div>
          <button className="btn btn-primary" onClick={() => window.location.href = '/events'}>
            Browse Events
          </button>
        </div>
        <div className="page-body">
          {loading ? (
             <div className="loading-center"><div className="loading-spinner" /></div>
          ) : reservations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <Ticket size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Reservations Found</div>
              <p style={{ marginBottom: 24 }}>Book parking through the event details page.</p>
              <button className="btn btn-primary" onClick={() => window.location.href = '/events'} style={{ margin: '0 auto' }}>
                Browse Events
              </button>
            </div>
          ) : (
            <div className="grid-2">
              {reservations.map(r => {
                let badgeClass = 'badge-default';
                if (r.status === 'RESERVED') badgeClass = 'badge-blue';
                if (r.status === 'CHECKED_IN') badgeClass = 'badge-moderate';
                if (r.status === 'CHECKED_OUT') badgeClass = 'badge-low';
                if (r.status === 'CANCELLED') badgeClass = 'badge-severe';

                return (
                  <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 18, marginBottom: 4 }}>{r.event_name}</h3>
                        <div className={`badge ${badgeClass}`}>{r.status.replace('_', ' ')}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, fontFamily: 'Outfit', letterSpacing: 1 }}>
                        {r.reservation_code}
                      </div>
                    </div>

                    <div className="divider" style={{ margin: '8px 0 16px' }} />

                    <div className="grid-2" style={{ gap: 12, flex: 1 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Parking Zone</div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.zone_name}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Gate</div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.entry_gate}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Vehicle</div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.vehicle_number}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Timing</div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{formatTime(r.start_time)} – {formatTime(r.end_time)}</div>
                      </div>
                    </div>

                    <div className="divider" style={{ margin: '16px 0' }} />

                    <div style={{ display: 'flex', gap: 12 }}>
                      <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleShowQR(r.id)} disabled={r.status === 'CANCELLED' || r.status === 'EXPIRED'}>
                        <QrCode size={16} /> Show Pass
                      </button>
                      {r.status === 'RESERVED' && (
                        <button className="btn btn-secondary" style={{ color: 'var(--accent-red)' }} onClick={() => handleCancel(r.id)}>
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* QR Modal */}
      {selectedQR && (
        <div className="modal-overlay" onClick={() => setSelectedQR(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, background: 'var(--bg-secondary)', border: 'none' }}>
            <div className="qr-pass">
              <div className="qr-pass-header">
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Parking Pass</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>Evetramasy</div>
              </div>
              <div style={{ background: '#fff', padding: 24, borderRadius: 16, display: 'inline-block', marginBottom: 24 }}>
                <img src={selectedQR} alt="QR Code" style={{ width: 220, height: 220, display: 'block' }} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Show this QR code at the parking entry gate for scanning.</p>
              <button className="btn btn-secondary w-full" style={{ marginTop: 24, justifyContent: 'center' }} onClick={() => setSelectedQR(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
