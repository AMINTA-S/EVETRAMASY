import React, { useState, useEffect } from 'react';
import { facilitiesAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Car, Calendar, Copy, Check } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/owner/dashboard' },
  { icon: Car, label: 'My Facilities', path: '/owner/facilities' },
  { icon: Calendar, label: 'Event Requests', path: '/owner/event-requests' },
];

export default function OwnerFacilities() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', total_capacity: '', hourly_rate: '' });
  const [saving, setSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  const load = () => {
    setLoading(true);
    facilitiesAPI.getMy().then(res => setFacilities(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await facilitiesAPI.create({ ...form, total_capacity: Number(form.total_capacity), hourly_rate: Number(form.hourly_rate) });
      setShowModal(false);
      setForm({ name: '', address: '', total_capacity: '', hourly_rate: '' });
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="PARKING_OWNER" />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">My Facilities</h1>
            <p className="page-subtitle">Manage your parking lots and sensor integrations</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Facility</button>
        </div>
        <div className="page-body">
          {loading ? (
            <div className="loading-center"><div className="loading-spinner"/></div>
          ) : (
            <div className="grid-1">
              {facilities.map(f => (
                <div key={f.id} className="card p-4" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}>{f.name}</h3>
                    <div className="badge badge-success">{f.status}</div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{f.address}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24 }}>
                    <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Capacity</div><div style={{ fontSize: 18, fontWeight: 600 }}>{f.total_capacity}</div></div>
                    <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Occupied</div><div style={{ fontSize: 18, fontWeight: 600 }}>{f.occupied_count}</div></div>
                    <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Available</div><div style={{ fontSize: 18, fontWeight: 600 }}>{f.available_spaces}</div></div>
                    <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Hourly Rate</div><div style={{ fontSize: 18, fontWeight: 600 }}>₹{f.hourly_rate}/hr</div></div>
                  </div>

                  <div style={{ marginTop: 24, padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                    <h4 style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-secondary)' }}>Sensor Integration (API Key)</h4>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <code style={{ flex: 1, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 4, fontSize: 13, wordBreak: 'break-all' }}>
                        {f.api_key}
                      </code>
                      <button className="btn btn-secondary" onClick={() => copyKey(f.api_key)}>
                        {copiedKey === f.api_key ? <Check size={16}/> : <Copy size={16}/>}
                      </button>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                      POST /api/facilities/{f.id}/sensor<br/>
                      Header: x-api-key: {f.api_key}<br/>
                      Body: {`{ "occupied_count": 45 }`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal card" style={{ padding: 24 }}>
            <h2 style={{ marginBottom: 16 }}>Add Parking Facility</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Facility Name</label>
                <input className="input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="label">Address</label>
                <input className="input" required value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Total Capacity</label>
                  <input type="number" className="input" required value={form.total_capacity} onChange={e => setForm({...form, total_capacity: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="label">Hourly Rate (₹)</label>
                  <input type="number" className="input" required value={form.hourly_rate} onChange={e => setForm({...form, hourly_rate: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving...' : 'Save Facility'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
