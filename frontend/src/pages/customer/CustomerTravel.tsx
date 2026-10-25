import React, { useState, useEffect } from 'react';
import { reservationsAPI, parkingAPI, trafficAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Car, Ticket, Navigation, Bell, AlertTriangle } from 'lucide-react';

export default function CustomerTravel() {
  const [activeRes, setActiveRes] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/customer/dashboard' },
    { icon: Ticket, label: 'My Reservations', path: '/customer/reservations' },
    { icon: Car, label: 'My Vehicles', path: '/customer/vehicles' },
    { icon: Navigation, label: 'Live Travel & Routes', path: '/customer/travel' },
    { icon: Bell, label: 'Notifications', path: '/customer/notifications' },
  ];

  useEffect(() => {
    const fetchTravelData = async () => {
      try {
        const resList = await reservationsAPI.getAll();
        const active = resList.data.find((r: any) => r.status === 'RESERVED' || r.status === 'CHECKED_IN');
        if (active) {
          setActiveRes(active);
          const [routeRes, alertRes] = await Promise.all([
            parkingAPI.getRoute(active.event_id, active.parking_zone_id),
            trafficAPI.getAlerts(active.event_id)
          ]);
          setRoute(routeRes.data);
          setAlerts(alertRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTravelData();
    const interval = setInterval(fetchTravelData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="CUSTOMER" />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Live Travel & Routing</h1>
          <p className="page-subtitle">Real-time navigation and traffic alerts for your upcoming event.</p>
        </div>
        <div className="page-body">
          {loading ? (
             <div className="loading-center"><div className="loading-spinner" /></div>
          ) : !activeRes ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <Navigation size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Active Travel Plan</div>
              <p>You need an active parking reservation to see routing data.</p>
            </div>
          ) : (
            <div className="grid-2">
              <div>
                <h3 style={{ marginBottom: 16 }}>Recommended Route</h3>
                {route ? (
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: 24, borderBottom: '1px solid var(--border)' }}>
                      <div className="flex justify-between items-center mb-4">
                        <div style={{ fontSize: 18, fontWeight: 700 }}>To {activeRes.zone_name}</div>
                        <div className="badge badge-nearly-full">{route.estimatedDelay}m expected delay</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--text-secondary)' }}>
                        <div><strong style={{ color: 'var(--text-primary)' }}>Via:</strong> {route.suggestedRoute[0]}</div>
                        <div><strong style={{ color: 'var(--text-primary)' }}>Entry Gate:</strong> {activeRes.entry_gate}</div>
                      </div>
                    </div>
                    <div style={{ padding: 24, background: 'rgba(255,255,255,0.02)' }}>
                      <h4 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Navigation Steps</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {route.suggestedRoute.map((step: string, i: number) => (
                          <div key={i} style={{ display: 'flex', gap: 12 }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                              {i+1}
                            </div>
                            <div style={{ paddingTop: 2 }}>{step}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card text-muted">Calculating route...</div>
                )}
              </div>

              <div>
                <h3 style={{ marginBottom: 16 }}>Live Traffic Alerts</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {alerts.length === 0 ? (
                    <div className="alert alert-success">🟢 Traffic is clear. No active alerts on your route.</div>
                  ) : (
                    alerts.map(a => (
                      <div key={a.id} className={`alert alert-${a.severity === 'SEVERE' ? 'danger' : 'warning'}`}>
                        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.road_name} ({a.severity})</div>
                          <div style={{ fontSize: 13 }}>{a.message}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
