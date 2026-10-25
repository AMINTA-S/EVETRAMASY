import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventsAPI, parkingAPI, trafficAPI, updatesAPI, simulationAPI } from '../../services/api';
import Sidebar from '../../components/shared/Sidebar';
import { LayoutDashboard, Calendar, QrCode, BarChart, ArrowLeft, Play, Square, Settings, Plus, Users, Car, AlertTriangle } from 'lucide-react';
import { formatDate, formatTime, getTrafficRiskLevel } from '../../utils/helpers';
import EventMap from '../../components/maps/EventMap';

export default function ManagerEventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [parkingZones, setParkingZones] = useState<any[]>([]);
  const [trafficZones, setTrafficZones] = useState<any[]>([]);
  const [gates, setGates] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [simStatus, setSimStatus] = useState<any>({ running: false, steps: [] });
  const [loading, setLoading] = useState(true);

  const [showParkingModal, setShowParkingModal] = useState(false);
  const [showTrafficModal, setShowTrafficModal] = useState(false);
  const [showGateModal, setShowGateModal] = useState(false);

  const [activeTab, setActiveTab] = useState('OVERVIEW');

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/manager/dashboard' },
    { icon: Calendar, label: 'My Events', path: '/manager/events' },
    { icon: QrCode, label: 'QR Scanner', path: '/manager/scanner' },
    { icon: BarChart, label: 'Analytics', path: '/manager/analytics' },
  ];

  const fetchData = async () => {
    try {
      if (!id) return;
      const [eRes, sRes, pRes, tRes, gRes, uRes, simRes] = await Promise.all([
        eventsAPI.getById(id),
        eventsAPI.getStats(id),
        parkingAPI.getZones(id),
        trafficAPI.getZones(id),
        trafficAPI.getGates(id),
        updatesAPI.getEventUpdates(id),
        simulationAPI.getStatus(id)
      ]);
      setEvent(eRes.data);
      setStats(sRes.data);
      setParkingZones(pRes.data);
      setTrafficZones(tRes.data);
      setGates(gRes.data);
      setUpdates(uRes.data);
      setSimStatus(simRes.data);
    } catch (err) {
      console.error(err);
      navigate('/manager/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => { if(activeTab === 'OVERVIEW' || activeTab === 'TRAFFIC') fetchData(); }, 15000);
    return () => clearInterval(interval);
  }, [id, activeTab]);

  const handleSimToggle = async () => {
    try {
      if (simStatus.running) await simulationAPI.stop(id!);
      else await simulationAPI.start(id!);
      fetchData();
    } catch (err) { alert('Simulation error'); }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    try {
      await updatesAPI.createUpdate(id!, { title: fd.get('title'), message: fd.get('message') });
      (e.target as HTMLFormElement).reset();
      fetchData();
    } catch (err) { alert('Failed to post update'); }
  };

  if (loading || !event) return <div className="layout-with-sidebar"><Sidebar navItems={navItems} role="MANAGER" /><main className="main-content"><div className="loading-center"><div className="loading-spinner" /></div></main></div>;

  const riskScore = parseInt(stats?.trafficRisk?.score || '0');
  const riskColor = riskScore > 75 ? '#ef4444' : riskScore > 50 ? '#f97316' : riskScore > 25 ? '#f59e0b' : '#22c55e';

  return (
    <div className="layout-with-sidebar">
      <Sidebar navItems={navItems} role="MANAGER" />
      <main className="main-content">
        <div className="page-header" style={{ paddingBottom: 0 }}>
          <Link to="/manager/events" className="flex items-center gap-2 text-muted mb-4 text-sm hover:text-white">
            <ArrowLeft size={16} /> Back to Events
          </Link>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="page-title">{event.name}</h1>
              <p className="page-subtitle">{formatDate(event.date)} · {formatTime(event.start_time)} – {formatTime(event.end_time)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`badge ${event.status === 'APPROVED' ? 'badge-low' : event.status === 'PENDING' ? 'badge-moderate' : 'badge-severe'}`}>
                {event.status}
              </span>
              <button className={`btn ${simStatus.running ? 'btn-danger' : 'btn-primary'}`} onClick={handleSimToggle}>
                {simStatus.running ? <><Square size={16}/> Stop Demo</> : <><Play size={16}/> Start Demo</>}
              </button>
            </div>
          </div>

          <div className="flex gap-6 border-b border-white/10" style={{ borderBottom: '1px solid var(--border)' }}>
            {['OVERVIEW', 'PARKING', 'TRAFFIC', 'MAP', 'UPDATES'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none', border: 'none', padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  color: activeTab === tab ? 'var(--accent-blue-light)' : 'var(--text-secondary)',
                  borderBottom: activeTab === tab ? '2px solid var(--accent-blue)' : '2px solid transparent',
                  marginBottom: -1
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="page-body">
          {activeTab === 'OVERVIEW' && (
            <div className="grid-2">
              <div className="flex-col gap-4">
                <div className="card">
                  <h3 className="mb-4">Traffic Risk Score</h3>
                  <div className="flex items-center justify-between">
                    <div className="risk-ring">
                      <div className="risk-value" style={{ color: riskColor }}>{riskScore}</div>
                      <div className="text-muted text-sm mt-1">out of 100</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg" style={{ color: riskColor }}>{stats?.trafficRisk?.level}</div>
                      <div className="text-sm text-muted mt-2 max-w-xs">{stats?.trafficRisk?.reason}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid-2">
                  <div className="stat-card">
                    <div className="stat-label">Reservations</div>
                    <div className="stat-value">{stats?.reservations}</div>
                    <div className="stat-sub">Tickets Booked</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Check-ins</div>
                    <div className="stat-value">{stats?.checkIns}</div>
                    <div className="stat-sub">{stats?.currentlyParked} currently parked</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="mb-4">Parking Utilization</h3>
                {parkingZones.map(pz => {
                  const util = pz.capacity ? Math.round((pz.occupied_count / pz.capacity) * 100) : 0;
                  return (
                    <div key={pz.id} className="mb-4 last:mb-0">
                      <div className="flex justify-between text-sm mb-2">
                        <span>{pz.name}</span>
                        <span className="font-semibold">{pz.occupied_count} / {pz.capacity} ({util}%)</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${util}%`, background: util > 90 ? '#ef4444' : util > 75 ? '#f97316' : '#22c55e' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'PARKING' && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3>Parking Zones</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowParkingModal(true)}>+ Add Zone</button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>Zone Name</th><th>Status</th><th>Capacity</th><th>Occupied</th><th>Available</th><th>Gates</th></tr>
                  </thead>
                  <tbody>
                    {parkingZones.map(z => (
                      <tr key={z.id}>
                        <td className="font-semibold">{z.name}</td>
                        <td><span className={`badge badge-${z.status.toLowerCase().replace('_','-')}`}>{z.status}</span></td>
                        <td>{z.capacity}</td>
                        <td>{z.occupied_count}</td>
                        <td>{z.available_spaces}</td>
                        <td className="text-sm text-muted">In: {z.entry_gate} | Out: {z.exit_gate}</td>
                      </tr>
                    ))}
                    {parkingZones.length === 0 && <tr><td colSpan={6} className="text-center text-muted">No parking zones added yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'TRAFFIC' && (
            <div className="grid-2">
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3>Traffic Zones</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowTrafficModal(true)}>+ Add Zone</button>
                </div>
                <div className="mt-4 flex-col gap-4">
                  {trafficZones.length === 0 && <div className="text-muted">No traffic zones added.</div>}
                  {trafficZones.map(tz => (
                    <div key={tz.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold">{tz.road_name}</div>
                        <span className={`badge badge-${tz.traffic_status.toLowerCase()}`}>{tz.traffic_status}</span>
                      </div>
                      <div className="text-sm text-muted">{tz.description}</div>
                      <div className="text-xs text-muted mt-2">Score: {tz.traffic_score}/100 · Impacts Gate: {tz.affected_gate}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3>Venue Gates</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowGateModal(true)}>+ Add Gate</button>
                </div>
                <div className="mt-4 flex-col gap-4">
                  {gates.length === 0 && <div className="text-muted">No gates added.</div>}
                  {gates.map(g => (
                    <div key={g.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold">{g.name} <span className="text-xs font-normal text-muted ml-2">({g.type})</span></div>
                        <span className={`badge ${g.status==='OPEN'?'badge-low':g.status==='CLOSED'?'badge-default':'badge-severe'}`}>{g.status}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Queue: <strong className="text-white">{g.queue_length}</strong> vehicles</span>
                        <span>Est. Wait: <strong className="text-white">{g.estimated_wait_time} min</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'MAP' && (
            <div className="card" style={{ padding: 0, height: 600 }}>
              <EventMap event={event} parkingZones={parkingZones} trafficZones={trafficZones} />
            </div>
          )}

          {activeTab === 'UPDATES' && (
            <div className="grid-2">
              <div className="card">
                <h3 className="mb-4">Post Announcement</h3>
                <form onSubmit={handleAddUpdate}>
                  <div className="form-group">
                    <label className="label">Title</label>
                    <input name="title" className="input" placeholder="e.g. Gate 1 Closed" required />
                  </div>
                  <div className="form-group">
                    <label className="label">Message</label>
                    <textarea name="message" className="input" rows={4} placeholder="Details about the update..." required />
                  </div>
                  <button type="submit" className="btn btn-primary w-full justify-center">Post Update to All Attendees</button>
                </form>
              </div>
              <div className="card">
                <h3 className="mb-4">Recent Updates</h3>
                <div className="flex-col gap-4">
                  {updates.length === 0 ? <div className="text-muted text-center py-8">No updates posted yet.</div> : updates.map(u => (
                    <div key={u.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">{u.title}</div>
                        <div className="text-xs text-muted">{formatDate(u.created_at)}</div>
                      </div>
                      <div className="text-sm text-secondary">{u.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showParkingModal && (
        <div className="modal-overlay">
          <div className="modal card" style={{ padding: 24, maxWidth: 400 }}>
            <h2 className="mb-4">Add Parking Zone</h2>
            <form onSubmit={async e => {
              e.preventDefault();
              const fd = new FormData(e.target as HTMLFormElement);
              await parkingAPI.createZone(id!, {
                name: fd.get('name'), capacity: Number(fd.get('capacity')), entry_gate: fd.get('entry_gate'), exit_gate: fd.get('exit_gate')
              });
              setShowParkingModal(false); fetchData();
            }}>
              <div className="form-group"><label className="label">Name</label><input name="name" className="input" required /></div>
              <div className="form-group"><label className="label">Capacity</label><input type="number" name="capacity" className="input" required /></div>
              <div className="grid-2">
                <div className="form-group"><label className="label">Entry Gate ID</label><input name="entry_gate" className="input" /></div>
                <div className="form-group"><label className="label">Exit Gate ID</label><input name="exit_gate" className="input" /></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowParkingModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTrafficModal && (
        <div className="modal-overlay">
          <div className="modal card" style={{ padding: 24, maxWidth: 400 }}>
            <h2 className="mb-4">Add Traffic Zone</h2>
            <form onSubmit={async e => {
              e.preventDefault();
              const fd = new FormData(e.target as HTMLFormElement);
              await trafficAPI.createZone(id!, {
                road_name: fd.get('road_name'), description: fd.get('description'), affected_gate: fd.get('affected_gate')
              });
              setShowTrafficModal(false); fetchData();
            }}>
              <div className="form-group"><label className="label">Road Name</label><input name="road_name" className="input" required /></div>
              <div className="form-group"><label className="label">Description</label><input name="description" className="input" /></div>
              <div className="form-group"><label className="label">Affected Gate ID</label><input name="affected_gate" className="input" /></div>
              <div className="flex gap-2 mt-4">
                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowTrafficModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGateModal && (
        <div className="modal-overlay">
          <div className="modal card" style={{ padding: 24, maxWidth: 400 }}>
            <h2 className="mb-4">Add Venue Gate</h2>
            <form onSubmit={async e => {
              e.preventDefault();
              const fd = new FormData(e.target as HTMLFormElement);
              await trafficAPI.createGate(id!, {
                name: fd.get('name'), type: fd.get('type')
              });
              setShowGateModal(false); fetchData();
            }}>
              <div className="form-group"><label className="label">Gate Name</label><input name="name" className="input" required placeholder="e.g. North Gate" /></div>
              <div className="form-group"><label className="label">Type</label>
                <select name="type" className="input">
                  <option value="ENTRY">ENTRY</option>
                  <option value="EXIT">EXIT</option>
                  <option value="BOTH">BOTH</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowGateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
