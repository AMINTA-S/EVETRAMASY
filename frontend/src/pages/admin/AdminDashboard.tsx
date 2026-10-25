import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Users, CalendarDays, BarChart, ShieldAlert, Activity, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { icon: LayoutDashboard, label: 'Platform Overview', path: '/admin/dashboard' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: CalendarDays, label: 'Event Approvals', path: '/admin/events' },
    { icon: BarChart, label: 'System Analytics', path: '/admin/analytics' },
    { icon: ShieldAlert, label: 'Audit Logs', path: '/admin/audit-logs' },
  ];

  useEffect(() => {
    adminAPI.getAnalytics().then(res => setAnalytics(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="ADMIN" />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Admin Command Center</h1>
          <p className="page-subtitle">Platform-wide overview and system health monitoring.</p>
        </div>
        <div className="page-body">
          {loading ? (
             <div className="loading-center"><div className="loading-spinner" /></div>
          ) : (
            <>
              <div className="grid-4 mb-6">
                <div className="stat-card">
                  <div className="flex items-center gap-2 mb-2 text-muted"><Users size={16}/> Total Users</div>
                  <div className="stat-value">{analytics?.users?.reduce((acc:any, u:any) => acc+parseInt(u.count), 0)}</div>
                </div>
                <div className="stat-card">
                  <div className="flex items-center gap-2 mb-2 text-muted"><CalendarDays size={16}/> Total Events</div>
                  <div className="stat-value">{analytics?.totalEvents}</div>
                </div>
                <div className="stat-card">
                  <div className="flex items-center gap-2 mb-2 text-muted"><Activity size={16}/> Active Check-ins</div>
                  <div className="stat-value text-green-400">{analytics?.currentlyParked}</div>
                </div>
                <div className="stat-card" style={{ borderColor: analytics?.activeAlerts > 0 ? 'rgba(239,68,68,0.3)' : 'var(--border)' }}>
                  <div className="flex items-center gap-2 mb-2 text-muted"><AlertTriangle size={16}/> Active Traffic Alerts</div>
                  <div className="stat-value" style={{ color: analytics?.activeAlerts > 0 ? '#ef4444' : '#f1f5f9' }}>{analytics?.activeAlerts}</div>
                </div>
              </div>

              <div className="grid-2">
                <div className="card">
                  <h3 className="mb-4">Quick Actions</h3>
                  <div className="flex-col gap-3">
                    <Link to="/admin/events" className="btn btn-secondary w-full justify-between">
                      Review Pending Events <span className="badge badge-nearly-full">{analytics?.eventStatus?.find((s:any)=>s.status==='PENDING')?.count || 0}</span>
                    </Link>
                    <Link to="/admin/users" className="btn btn-secondary w-full justify-between">
                      Review Manager Accounts <span className="badge badge-nearly-full">{analytics?.users?.find((u:any)=>u.role==='MANAGER')?.count || 0}</span>
                    </Link>
                  </div>
                </div>
                
                <div className="card">
                  <h3 className="mb-4">System Status</h3>
                  <div className="flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted">API Services</span>
                      <span className="badge badge-low">Operational</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted">Database Health</span>
                      <span className="badge badge-low">Operational</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted">High Risk Events (Score &gt; 50)</span>
                      <span className="badge badge-moderate">{analytics?.highRiskEvents}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
