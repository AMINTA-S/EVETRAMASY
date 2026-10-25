import React, { useState } from 'react';
import { eventsAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Calendar, QrCode, BarChart, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function ManagerCreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', category: 'CONCERT', description: '', date: '', start_time: '', end_time: '',
    venue: '', address: '', expected_attendees: '', expected_vehicle_percentage: '30'
  });
  const [loading, setLoading] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/manager/dashboard' },
    { icon: Calendar, label: 'My Events', path: '/manager/events' },
    { icon: QrCode, label: 'QR Scanner', path: '/manager/scanner' },
    { icon: BarChart, label: 'Analytics', path: '/manager/analytics' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, expected_attendees: parseInt(form.expected_attendees||'0'), expected_vehicle_percentage: parseFloat(form.expected_vehicle_percentage||'30') };
      const res = await eventsAPI.create(data);
      navigate(`/manager/events/${res.data.id}`);
    } catch (err) {
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="MANAGER" />
      <main className="main-content">
        <div className="page-header">
          <Link to="/manager/events" className="flex items-center gap-2 text-muted mb-4 text-sm hover:text-white">
            <ArrowLeft size={16} /> Back to Events
          </Link>
          <h1 className="page-title">Create New Event</h1>
          <p className="page-subtitle">Set up basic details. You can configure parking and traffic zones later.</p>
        </div>
        <div className="page-body">
          <div className="card" style={{ maxWidth: 800 }}>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="label">Event Name</label>
                  <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="label">Category</label>
                  <select className="input select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="CONCERT">Concert</option>
                    <option value="SPORTS">Sports</option>
                    <option value="EXHIBITION">Exhibition</option>
                    <option value="CULTURAL">Cultural</option>
                    <option value="CONFERENCE">Conference</option>
                    <option value="FESTIVAL">Festival</option>
                    <option value="RELIGIOUS">Religious</option>
                    <option value="FAIR">Fair</option>
                    <option value="CORPORATE">Corporate</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Date</label>
                  <input type="date" className="input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="label">Start Time</label>
                  <input type="time" className="input" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="label">End Time</label>
                  <input type="time" className="input" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="label">Venue Name</label>
                  <input className="input" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="label">Description</label>
                  <textarea className="input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="label">Expected Attendees</label>
                  <input type="number" className="input" value={form.expected_attendees} onChange={e => setForm({...form, expected_attendees: e.target.value})} required min="1" />
                </div>
                <div className="form-group">
                  <label className="label">Expected Vehicle % (e.g. 30 for 30%)</label>
                  <input type="number" className="input" value={form.expected_vehicle_percentage} onChange={e => setForm({...form, expected_vehicle_percentage: e.target.value})} required min="1" max="100" />
                </div>
              </div>
              <div className="divider" />
              <div className="flex justify-end gap-3">
                <Link to="/manager/events" className="btn btn-secondary">Cancel</Link>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
