import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Users, CalendarDays, BarChart, ShieldAlert, MoreVertical, Check, X } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const navItems = [
    { icon: LayoutDashboard, label: 'Platform Overview', path: '/admin/dashboard' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: CalendarDays, label: 'Event Approvals', path: '/admin/events' },
    { icon: BarChart, label: 'System Analytics', path: '/admin/analytics' },
    { icon: ShieldAlert, label: 'Audit Logs', path: '/admin/audit-logs' },
  ];

  const fetchUsers = () => {
    setLoading(true);
    const params: any = {};
    if (filterRole) params.role = filterRole;
    if (filterStatus) params.status = filterStatus;
    adminAPI.getUsers(params).then(res => setUsers(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [filterRole, filterStatus]);

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!confirm(`Change user status to ${status}?`)) return;
    try {
      await adminAPI.updateUserStatus(id, status);
      fetchUsers();
    } catch (err) { alert('Failed to update status'); }
  };

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="ADMIN" />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">Manage accounts and approve manager access.</p>
          </div>
          <div className="flex gap-2">
            <select className="input select py-1 px-3 text-sm h-9" value={filterRole} onChange={e=>setFilterRole(e.target.value)}>
              <option value="">All Roles</option>
              <option value="MANAGER">Managers</option>
              <option value="CUSTOMER">Customers</option>
              <option value="ADMIN">Admins</option>
            </select>
            <select className="input select py-1 px-3 text-sm h-9" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending Approval</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
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
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="font-semibold">{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role==='MANAGER'?'badge-blue':u.role==='ADMIN'?'badge-purple':'badge-default'}`}>{u.role}</span>
                        </td>
                        <td>
                          <span className={`badge ${u.status==='ACTIVE'?'badge-low':u.status==='PENDING'?'badge-moderate':'badge-severe'}`}>{u.status}</span>
                        </td>
                        <td className="text-sm text-muted">{formatDate(u.created_at)}</td>
                        <td>
                          <div className="flex gap-2">
                            {u.status === 'PENDING' && (
                              <button className="btn btn-sm btn-success" onClick={() => handleUpdateStatus(u.id, 'ACTIVE')} title="Approve">
                                <Check size={14}/>
                              </button>
                            )}
                            {u.status === 'ACTIVE' && u.role !== 'ADMIN' && (
                              <button className="btn btn-sm btn-danger" onClick={() => handleUpdateStatus(u.id, 'SUSPENDED')} title="Suspend">
                                <X size={14}/>
                              </button>
                            )}
                            {u.status === 'SUSPENDED' && (
                              <button className="btn btn-sm btn-success" onClick={() => handleUpdateStatus(u.id, 'ACTIVE')} title="Reactivate">
                                <Check size={14}/>
                              </button>
                            )}
                          </div>
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
