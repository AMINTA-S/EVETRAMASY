import React, { useState, useEffect } from 'react';
import { facilitiesAPI, eventsAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Car, Calendar, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/owner/dashboard' },
  { icon: Car, label: 'My Facilities', path: '/owner/facilities' },
  { icon: Calendar, label: 'Event Requests', path: '/owner/event-requests' },
];

export default function OwnerEventRequests() {
  const [activeTab, setActiveTab] = useState('new');
  const [events, setEvents] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [form, setForm] = useState({ facilityId: '', requestedCapacity: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      eventsAPI.getAll(),
      facilitiesAPI.getMyRequests(),
      facilitiesAPI.getMy()
    ]).then(([e, r, f]) => {
      setEvents(e.data.filter((ev: any) => ev.status === 'APPROVED' || ev.status === 'ACTIVE'));
      setRequests(r.data);
      setFacilities(f.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.facilityId) return alert('Select a facility');
    setSubmitting(true);
    try {
      await facilitiesAPI.createEventRequest(form.facilityId, {
        event_id: selectedEvent.id,
        requested_capacity: Number(form.requestedCapacity),
        message: form.message
      });
      setSelectedEvent(null);
      setForm({ facilityId: '', requestedCapacity: '', message: '' });
      const r = await facilitiesAPI.getMyRequests();
      setRequests(r.data);
      setActiveTab('history');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="PARKING_OWNER" />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Event Partnerships</h1>
          <p className="page-subtitle">Offer your parking facility capacity for upcoming events</p>
        </div>
        
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <button className={`btn ${activeTab === 'new' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('new')} style={{ borderRadius: '8px 8px 0 0' }}>
            Find Events
          </button>
          <button className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('history')} style={{ borderRadius: '8px 8px 0 0' }}>
            My Requests ({requests.length})
          </button>
        </div>

        <div className="page-body">
          {loading ? (
            <div className="loading-center"><div className="loading-spinner"/></div>
          ) : activeTab === 'new' ? (
            <div className="grid-2">
              {events.map(ev => (
                <div key={ev.id} className="card p-4">
                  <h3 style={{ margin: '0 0 8px 0' }}>{ev.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>{ev.venue} • {formatDate(ev.date)}</p>
                  <button className="btn btn-secondary w-full" style={{ justifyContent: 'center' }} onClick={() => setSelectedEvent(ev)}>
                    Offer Parking Space <ArrowRight size={16}/>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-1">
              {requests.map(req => (
                <div key={req.id} className="card p-4">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{req.event_name}</h4>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{req.facility_name} • {req.requested_capacity} spaces offered</p>
                    </div>
                    <div>
                      <span className={`badge ${req.status === 'APPROVED' ? 'badge-success' : req.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {requests.length === 0 && <p>No partnership requests yet.</p>}
            </div>
          )}
        </div>
      </main>

      {selectedEvent && (
        <div className="modal-overlay">
          <div className="modal card" style={{ padding: 24 }}>
            <h2 style={{ marginBottom: 16 }}>Offer Parking for {selectedEvent.name}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Select Facility</label>
                <select className="input" required value={form.facilityId} onChange={e => setForm({...form, facilityId: e.target.value})}>
                  <option value="">-- Choose Facility --</option>
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.available_spaces} available)</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Number of Spaces to Offer</label>
                <input type="number" className="input" required value={form.requestedCapacity} onChange={e => setForm({...form, requestedCapacity: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="label">Message to Event Manager (Optional)</label>
                <textarea className="input" rows={3} value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedEvent(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>{submitting ? 'Sending...' : 'Send Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
