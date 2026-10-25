import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Users, CalendarDays, BarChart, ShieldAlert, Check, X, MapPin } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { icon: LayoutDashboard, label: 'Platform Overview', path: '/admin/dashboard' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: CalendarDays, label: 'Event Approvals', path: '/admin/events' },
    { icon: BarChart, label: 'System Analytics', path: '/admin/analytics' },
    { icon: ShieldAlert, label: 'Audit Logs', path: '/admin/audit-logs' },
  ];

  const fetchEvents = () => {
    setLoading(true);
    adminAPI.getAllEvents().then(res => setEvents(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this event? It will become visible to customers.')) return;
    try {
      await adminAPI.approveEvent(id);
      fetchEvents();
    } catch (err) { alert('Failed to approve'); }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Reason for rejection:');
    if (reason === null) return;
    try {
      await adminAPI.rejectEvent(id, reason);
      fetchEvents();
    } catch (err) { alert('Failed to reject'); }
  };

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="ADMIN" />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Event Approvals</h1>
            <p className="page-subtitle">Review and approve manager-created events.</p>
          </div>
          <button className="btn btn-primary" onClick={() => window.location.href = '/admin/events/create'}>
            + Create Event
          </button>
        </div>
        <div className="page-body">
          {loading ? (
             <div className="loading-center"><div className="loading-spinner" /></div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr><th>Event Name</th><th>Manager</th><th>Date & Venue</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {events.map(e => (
                      <tr key={e.id}>
                        <td>
                          <div className="font-semibold">{e.name}</div>
                          <div className="text-xs text-muted mt-1">{e.category}</div>
                        </td>
                        <td>{e.manager_name}</td>
                        <td>
                          <div>{formatDate(e.date)}</div>
                          <div className="text-xs text-muted mt-1 flex items-center gap-1"><MapPin size={12}/> {e.venue}</div>
                        </td>
                        <td>
                          <span className={`badge ${e.status==='APPROVED'||e.status==='ACTIVE'?'badge-low':e.status==='PENDING'?'badge-moderate':'badge-severe'}`}>{e.status}</span>
                        </td>
                        <td>
                          {e.status === 'PENDING' ? (
                            <div className="flex gap-2">
                              <button className="btn btn-sm btn-success" onClick={() => handleApprove(e.id)}>Approve</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleReject(e.id)}>Reject</button>
                            </div>
                          ) : (
                            <span className="text-muted text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
