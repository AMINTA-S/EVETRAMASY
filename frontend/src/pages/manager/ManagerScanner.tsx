import React, { useState } from 'react';
import { reservationsAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Calendar, QrCode, BarChart, Camera, CheckCircle2, XCircle } from 'lucide-react';
// @ts-ignore
import jsQR from 'jsqr';

export default function ManagerScanner() {
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [simToken, setSimToken] = useState('');

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/manager/dashboard' },
    { icon: Calendar, label: 'My Events', path: '/manager/events' },
    { icon: QrCode, label: 'QR Scanner', path: '/manager/scanner' },
    { icon: BarChart, label: 'Analytics', path: '/manager/analytics' },
  ];

  // In a real app, we'd use a camera stream here.
  // For this prototype, we'll allow manual entry of the token for testing.
  const handleVerify = async (e: React.FormEvent, action: string) => {
    e.preventDefault();
    setError(''); setScanResult(null); setLoading(true);
    try {
      const res = await reservationsAPI.verify({ token: simToken, action });
      setScanResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid QR code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="MANAGER" />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Parking Scanner</h1>
          <p className="page-subtitle">Scan customer QR passes at entry and exit gates.</p>
        </div>
        <div className="page-body">
          <div className="grid-2">
            <div className="card">
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed var(--border)', marginBottom: 24 }}>
                <Camera size={48} style={{ margin: '0 auto 16px', color: 'var(--text-muted)' }} />
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>Camera Access Required</h3>
                <p className="text-muted text-sm">In a production environment, this would open the device camera to scan QR codes natively.</p>
              </div>

              <div className="divider">OR SIMULATE SCAN</div>

              <form onSubmit={e => handleVerify(e, 'VERIFY')} className="mt-4">
                <div className="form-group">
                  <label className="label">QR Token UUID (from DB for testing)</label>
                  <input className="input" placeholder="Enter UUID token" value={simToken} onChange={e => setSimToken(e.target.value)} required />
                </div>
                <div className="flex gap-3">
                  <button type="button" className="btn btn-primary flex-1 justify-center" onClick={e => handleVerify(e as any, 'CHECKIN')} disabled={loading||!simToken}>
                    Process Check-In
                  </button>
                  <button type="button" className="btn btn-secondary flex-1 justify-center" onClick={e => handleVerify(e as any, 'CHECKOUT')} disabled={loading||!simToken}>
                    Process Check-Out
                  </button>
                </div>
              </form>
            </div>

            <div>
              {error && (
                <div className="card" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', textAlign: 'center', padding: 40 }}>
                  <XCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
                  <h3 className="text-xl font-bold text-red-500 mb-2">Scan Failed</h3>
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {scanResult && scanResult.valid && (
                <div className="card" style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' }}>
                  <div className="text-center mb-6">
                    <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 16px' }} />
                    <h3 className="text-xl font-bold text-green-500 mb-2">Success: {scanResult.action}</h3>
                    <p className="text-green-400">Reservation is valid and processed.</p>
                  </div>
                  
                  <div className="bg-black/20 p-4 rounded-lg">
                    <div className="grid-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted mb-1">Customer Name</div>
                        <div className="font-semibold">{scanResult.reservation.customer_name}</div>
                      </div>
                      <div>
                        <div className="text-muted mb-1">Vehicle</div>
                        <div className="font-semibold">{scanResult.reservation.vehicle_number}</div>
                      </div>
                      <div>
                        <div className="text-muted mb-1">Event</div>
                        <div className="font-semibold">{scanResult.reservation.event_name}</div>
                      </div>
                      <div>
                        <div className="text-muted mb-1">Parking Zone</div>
                        <div className="font-semibold">{scanResult.reservation.zone_name}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!error && !scanResult && (
                <div className="card h-full flex items-center justify-center text-muted">
                  Scan a QR code to see details here.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
