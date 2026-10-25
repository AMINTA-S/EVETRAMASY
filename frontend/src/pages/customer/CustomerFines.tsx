import React, { useState, useEffect } from 'react';
import { finesAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Car, Ticket, Navigation, Bell, AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/customer/dashboard' },
  { icon: Ticket, label: 'My Reservations', path: '/customer/reservations' },
  { icon: Car, label: 'My Vehicles', path: '/customer/vehicles' },
  { icon: Navigation, label: 'Live Travel & Routes', path: '/customer/travel' },
  { icon: AlertCircle, label: 'My Fines', path: '/customer/fines' },
  { icon: Bell, label: 'Notifications', path: '/customer/notifications' },
];

export default function CustomerFines() {
  const [fines, setFines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFines = () => {
    setLoading(true);
    finesAPI.getMy().then(res => setFines(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadFines(); }, []);

  const handlePay = async (id: string) => {
    try {
      await finesAPI.pay(id);
      loadFines();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to pay fine');
    }
  };

  const unpaidTotal = fines.filter(f => f.status === 'UNPAID').reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="CUSTOMER" />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">My Fines</h1>
            <p className="page-subtitle">Manage and pay your parking overstay fines</p>
          </div>
          {unpaidTotal > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', padding: '8px 16px', borderRadius: 8, fontWeight: 600 }}>
              Total Due: ₹{unpaidTotal}
            </div>
          )}
        </div>
        <div className="page-body">
          {loading ? (
            <div className="loading-center"><div className="loading-spinner"/></div>
          ) : fines.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <AlertCircle size={48} style={{ color: 'var(--accent-green)', margin: '0 auto 16px' }} />
              <h3>No Fines</h3>
              <p style={{ color: 'var(--text-secondary)' }}>You have a clean record!</p>
            </div>
          ) : (
            <div className="grid-1">
              {fines.map(f => (
                <div key={f.id} className="card p-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0' }}>₹{f.amount} <span style={{ fontSize: 14, fontWeight: 'normal', color: 'var(--text-secondary)' }}>({f.hours_overstayed} hrs)</span></h3>
                    <p style={{ margin: '0 0 8px 0', fontSize: 14 }}>{f.reason}</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                      Reservation: {f.reservation_code} {f.event_name ? `(${f.event_name})` : ''} • Issued: {formatDate(f.created_at)}
                    </p>
                  </div>
                  <div>
                    {f.status === 'PAID' ? (
                      <span className="badge badge-success">PAID</span>
                    ) : (
                      <button className="btn btn-primary" onClick={() => handlePay(f.id)}>Pay Now</button>
                    )}
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
