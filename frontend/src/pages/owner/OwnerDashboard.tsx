import React, { useState, useEffect } from 'react';
import { facilitiesAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Car, Calendar } from 'lucide-react';
import { calcUtilization } from '../../utils/helpers';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/owner/dashboard' },
  { icon: Car, label: 'My Facilities', path: '/owner/facilities' },
  { icon: Calendar, label: 'Event Requests', path: '/owner/event-requests' },
];

export default function OwnerDashboard() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    facilitiesAPI.getMy().then(res => setFacilities(res.data)).finally(() => setLoading(false));
  }, []);

  const totalCap = facilities.reduce((sum, f) => sum + (f.total_capacity || 0), 0);
  const totalOcc = facilities.reduce((sum, f) => sum + (f.occupied_count || 0), 0);
  const overallUtil = calcUtilization(totalOcc, totalCap);

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="PARKING_OWNER" />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Parking Owner Dashboard</h1>
          <p className="page-subtitle">Live occupancy and facility stats</p>
        </div>
        <div className="page-body">
          {loading ? (
            <div className="loading-center"><div className="loading-spinner"/></div>
          ) : (
            <>
              <div className="grid-3" style={{ marginBottom: 32 }}>
                <div className="stat-card">
                  <div className="stat-label">Total Facilities</div>
                  <div className="stat-value">{facilities.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Overall Capacity</div>
                  <div className="stat-value">{totalCap} spaces</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Currently Occupied</div>
                  <div className="stat-value" style={{ color: overallUtil >= 90 ? 'var(--text-danger)' : 'inherit' }}>
                    {totalOcc} ({Math.round(overallUtil)}%)
                  </div>
                </div>
              </div>
              
              <h3 style={{ marginBottom: 16 }}>Live Facilities</h3>
              {facilities.length === 0 ? (
                <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                  <p>No facilities registered yet.</p>
                </div>
              ) : (
                <div className="grid-2">
                  {facilities.map(f => {
                    const util = calcUtilization(f.occupied_count, f.total_capacity);
                    return (
                      <div key={f.id} className="card p-4">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                          <h4 style={{ margin: 0 }}>{f.name}</h4>
                          <span className="badge badge-success">{f.status}</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{f.address}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                          <span>{f.occupied_count} / {f.total_capacity} occupied</span>
                          <span>{Math.round(util)}%</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: util >= 90 ? 'var(--accent-red)' : util >= 75 ? 'var(--accent-orange)' : 'var(--accent-green)', width: `${util}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
