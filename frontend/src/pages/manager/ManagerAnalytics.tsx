import React from 'react';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Calendar, QrCode, BarChart } from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

export default function ManagerAnalytics() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/manager/dashboard' },
    { icon: Calendar, label: 'My Events', path: '/manager/events' },
    { icon: QrCode, label: 'QR Scanner', path: '/manager/scanner' },
    { icon: BarChart, label: 'Analytics', path: '/manager/analytics' },
  ];

  // Dummy data for visual prototype
  const arrivalData = [
    { time: '16:00', arrivals: 120 }, { time: '16:30', arrivals: 250 },
    { time: '17:00', arrivals: 450 }, { time: '17:30', arrivals: 890 },
    { time: '18:00', arrivals: 1200 }, { time: '18:30', arrivals: 800 },
    { time: '19:00', arrivals: 300 }
  ];

  const zoneData = [
    { name: 'Zone A', utilized: 85, capacity: 100 },
    { name: 'Zone B', utilized: 60, capacity: 100 },
    { name: 'Zone C', utilized: 20, capacity: 100 },
  ];

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="MANAGER" />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Event Analytics</h1>
          <p className="page-subtitle">Understand traffic flow and parking utilization across your events.</p>
        </div>
        <div className="page-body">
          <div className="grid-2 mb-6">
            <div className="card">
              <h3 className="mb-4">Peak Arrival Flow (Simulation)</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={arrivalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="arrivals" stroke="var(--accent-blue)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent-blue)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 className="mb-4">Average Zone Utilization</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={zoneData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="utilized" fill="var(--accent-cyan)" radius={[4, 4, 0, 0]} />
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
