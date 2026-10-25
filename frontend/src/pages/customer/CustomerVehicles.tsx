import React, { useState, useEffect } from 'react';
import { vehiclesAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Car, Ticket, Navigation, Bell, Plus, Trash2, Edit } from 'lucide-react';

export default function CustomerVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ vehicle_type: 'CAR', vehicle_number: '', model: '', color: '' });

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/customer/dashboard' },
    { icon: Ticket, label: 'My Reservations', path: '/customer/reservations' },
    { icon: Car, label: 'My Vehicles', path: '/customer/vehicles' },
    { icon: Navigation, label: 'Live Travel & Routes', path: '/customer/travel' },
    { icon: Bell, label: 'Notifications', path: '/customer/notifications' },
  ];

  const fetchVehicles = () => {
    setLoading(true);
    vehiclesAPI.getAll().then(res => setVehicles(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vehiclesAPI.add(form);
      setShowAdd(false);
      setForm({ vehicle_type: 'CAR', vehicle_number: '', model: '', color: '' });
      fetchVehicles();
    } catch (err) {
      alert('Failed to add vehicle');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this vehicle?')) return;
    try {
      await vehiclesAPI.delete(id);
      fetchVehicles();
    } catch (err) { alert('Failed to delete'); }
  };

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="CUSTOMER" />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">My Vehicles</h1>
            <p className="page-subtitle">Manage your registered vehicles for event parking.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={18} /> Add Vehicle
          </button>
        </div>
        <div className="page-body">
          {showAdd && (
            <div className="card mb-6">
              <h3 style={{ marginBottom: 16 }}>Register New Vehicle</h3>
              <form onSubmit={handleAdd} className="grid-2">
                <div className="form-group">
                  <label className="label">Vehicle Type</label>
                  <select className="input select" value={form.vehicle_type} onChange={e => setForm({...form, vehicle_type: e.target.value})}>
                    <option value="CAR">Car</option>
                    <option value="BIKE">Bike</option>
                    <option value="SUV">SUV</option>
                    <option value="BUS">Bus/Minibus</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Vehicle Number</label>
                  <input className="input" placeholder="e.g. TN01AB1234" value={form.vehicle_number} onChange={e => setForm({...form, vehicle_number: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="label">Model / Make</label>
                  <input className="input" placeholder="e.g. Hyundai i20" value={form.model} onChange={e => setForm({...form, model: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="label">Color</label>
                  <input className="input" placeholder="e.g. White" value={form.color} onChange={e => setForm({...form, color: e.target.value})} required />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Vehicle</button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
             <div className="loading-center"><div className="loading-spinner" /></div>
          ) : vehicles.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <Car size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Vehicles Registered</div>
              <p>Add a vehicle to make parking reservations.</p>
            </div>
          ) : (
            <div className="grid-3">
              {vehicles.map(v => (
                <div key={v.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div className="badge badge-blue">{v.vehicle_type}</div>
                    <button onClick={() => handleDelete(v.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h3 style={{ fontSize: 22, fontFamily: 'Outfit', letterSpacing: 1, marginBottom: 8 }}>{v.vehicle_number}</h3>
                  <div style={{ color: 'var(--text-secondary)' }}>{v.color} {v.model}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
