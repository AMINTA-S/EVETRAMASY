import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Users, CalendarDays, BarChart, ShieldAlert, Terminal, Search } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/helpers';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const navItems = [
    { icon: LayoutDashboard, label: 'Platform Overview', path: '/admin/dashboard' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: CalendarDays, label: 'Event Approvals', path: '/admin/events' },
    { icon: BarChart, label: 'System Analytics', path: '/admin/analytics' },
    { icon: ShieldAlert, label: 'Audit Logs', path: '/admin/audit-logs' },
  ];

  useEffect(() => {
    adminAPI.getAuditLogs().then(res => setLogs(res.data)).finally(() => setLoading(false));
  }, []);

  const filteredLogs = search 
    ? logs.filter(l => 
        l.action.toLowerCase().includes(search.toLowerCase()) || 
        l.user_email?.toLowerCase().includes(search.toLowerCase()) ||
        l.entity_type.toLowerCase().includes(search.toLowerCase())
      ) 
    : logs;

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="ADMIN" />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">System Audit Logs</h1>
            <p className="page-subtitle">Security and operational activity tracking.</p>
          </div>
          <div style={{ position: 'relative', width: 300 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
          </div>
        </div>
        <div className="page-body">
          {loading ? (
             <div className="loading-center"><div className="loading-spinner" /></div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr><th>Timestamp</th><th>User / System</th><th>Action</th><th>Target Entity</th><th>IP Address</th></tr>
                  </thead>
                  <tbody style={{ fontFamily: 'monospace', fontSize: 13 }}>
                    {filteredLogs.map(l => (
                      <tr key={l.id}>
                        <td className="text-muted">{formatDate(l.created_at)} {formatTime(l.created_at)}</td>
                        <td>
                          {l.user_email ? (
                            <span style={{ color: 'var(--accent-blue-light)' }}>{l.user_email}</span>
                          ) : (
                            <span className="badge badge-default"><Terminal size={10} style={{ display: 'inline', marginRight: 4 }}/> SYSTEM</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 600, color: l.action.includes('DELETE')||l.action.includes('REJECT') ? '#ef4444' : l.action.includes('CREATE')||l.action.includes('APPROVE') ? '#22c55e' : '#f8fafc' }}>
                          {l.action}
                        </td>
                        <td>{l.entity_type} <span className="text-muted">({l.entity_id.substring(0,8)}...)</span></td>
                        <td className="text-muted">{l.ip_address}</td>
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
