import React from 'react';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Users, CalendarDays, BarChart, ShieldAlert } from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';

export default function AdminAnalytics() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Platform Overview', path: '/admin/dashboard' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: CalendarDays, label: 'Event Approvals', path: '/admin/events' },
    { icon: BarChart, label: 'System Analytics', path: '/admin/analytics' },
    { icon: ShieldAlert, label: 'Audit Logs', path: '/admin/audit-logs' },
  ];

  // Dummy data
  const growthData = [
    { month: 'Jan', users: 400, events: 24 },
    { month: 'Feb', users: 800, events: 45 },
    { month: 'Mar', users: 1200, events: 78 },
    { month: 'Apr', users: 1900, events: 110 },
    { month: 'May', users: 2400, events: 145 },
    { month: 'Jun', users: 3100, events: 190 },
  ];

  const cityData = [
    { name: 'Chennai', value: 85 },
    { name: 'Coimbatore', value: 45 },
    { name: 'Madurai', value: 25 },
    { name: 'Trichy', value: 15 },
  ];

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="ADMIN" />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Platform Analytics</h1>
          <p className="page-subtitle">Growth metrics and regional adoption data.</p>
        </div>
        <div className="page-body">
          <div className="grid-2 mb-6">
            <div className="card">
              <h3 className="mb-4">User Growth Trend</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="users" stroke="var(--accent-purple)" fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 className="mb-4">Event Distribution by City</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={cityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" fontSize={12} width={80} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="value" fill="var(--accent-blue)" radius={[0, 4, 4, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
