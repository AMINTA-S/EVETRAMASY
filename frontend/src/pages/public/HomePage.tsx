import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../services/api';
import { getCategoryIcon, getTrafficBadgeClass, formatDate, formatTime, calcUtilization, getUtilizationColor } from '../../utils/helpers';
import { Car, MapPin, Clock, Users, AlertTriangle, Search, Filter, ChevronRight, Zap, Shield, BarChart3, Navigation } from 'lucide-react';

interface Event {
  id: string; name: string; category: string; date: string;
  start_time: string; end_time: string; venue: string; address: string;
  expected_attendees: number; estimated_vehicle_count: number;
  total_parking: number; total_available: number; total_occupied: number;
  traffic_risk_score: number; status: string; manager_name: string;
}

const CATEGORIES = ['ALL','CONCERT','SPORTS','EXHIBITION','CULTURAL','CONFERENCE','FESTIVAL','RELIGIOUS','FAIR','CORPORATE'];

function TrafficRiskBadge({ score }: { score: number }) {
  const level = score <= 25 ? 'LOW' : score <= 50 ? 'MODERATE' : score <= 75 ? 'HIGH' : 'SEVERE';
  const cls = getTrafficBadgeClass(level);
  const icon = score > 75 ? '🔴' : score > 50 ? '🟠' : score > 25 ? '🟡' : '🟢';
  return <span className={`badge ${cls}`}>{icon} {level}</span>;
}

function ParkingBadge({ available, total }: { available: number; total: number }) {
  if (total === 0) return <span className="badge badge-default">No Parking</span>;
  const pct = calcUtilization(total - available, total);
  if (pct >= 100) return <span className="badge badge-full">⛔ Full</span>;
  if (pct >= 90) return <span className="badge badge-critical">🔴 {available} left</span>;
  if (pct >= 75) return <span className="badge badge-nearly-full">🟠 {available} spaces</span>;
  return <span className="badge badge-available">🟢 {available} spaces</span>;
}

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filtered, setFiltered] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');

  useEffect(() => {
    eventsAPI.getAll().then(res => {
      setEvents(res.data);
      setFiltered(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let f = events;
    if (search) f = f.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.venue.toLowerCase().includes(search.toLowerCase()));
    if (category !== 'ALL') f = f.filter(e => e.category === category);
    setFiltered(f);
  }, [search, category, events]);

  const handleDashboard = () => {
    if (!user) { navigate('/login'); return; }
    if (user.role === 'ADMIN') navigate('/admin/dashboard');
    else if (user.role === 'MANAGER') navigate('/manager/dashboard');
    else navigate('/customer/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo">
          <span className="gradient-text">⚡ Evetramasy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', padding: '8px 12px', fontSize: 14 }}>Home</Link>
          <Link to="/events" style={{ color: 'var(--text-secondary)', padding: '8px 12px', fontSize: 14 }}>Events</Link>
          {user ? (
            <button className="btn btn-primary btn-sm" onClick={handleDashboard}>
              My Dashboard
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="hero" style={{ minHeight: '75vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 780, padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <div className="badge badge-blue" style={{ marginBottom: 20, fontSize: 12 }}>
            🚦 Smart City Traffic Management Platform
          </div>
          <h1 style={{ fontSize: 'clamp(36px,6vw,72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24 }}>
            Smart Traffic Management<br/>
            <span className="gradient-text">for Every Event</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.8 }}>
            Plan your parking, avoid congestion, and reach your event smarter.<br/>
            Real-time traffic intelligence for Chennai's biggest events.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#events" className="btn btn-primary btn-lg">
              Explore Events <ChevronRight size={18} />
            </a>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Register Free
            </Link>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 60, flexWrap: 'wrap' }}>
            {[
              { val: events.length || '5', label: 'Live Events' },
              { val: '50K+', label: 'Attendees Tracked' },
              { val: '6,500+', label: 'Parking Spaces' },
              { val: 'Real-time', label: 'Traffic Updates' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent-blue-light)' }}>{s.val}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ padding: '80px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800 }}>How Evetramasy Works</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 16 }}>The intelligent feedback loop that keeps traffic moving</p>
        </div>
        <div style={{ display: 'flex', gap: 0, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          {[
            { icon: <Users size={28} />, title: 'Event & Attendance', desc: 'Event details and expected vehicle demand are calculated' },
            { icon: <Car size={28} />, title: 'Vehicle Demand', desc: 'System estimates parking pressure and shortage risk' },
            { icon: <BarChart3 size={28} />, title: 'Traffic Risk Score', desc: 'Dynamic 0–100 score based on all live conditions' },
            { icon: <Navigation size={28} />, title: 'Smart Recommendations', desc: 'Best parking zone and route suggested to each driver' },
            { icon: <Zap size={28} />, title: 'Live Updates', desc: 'Alerts sent as conditions change in real time' },
            { icon: <Shield size={28} />, title: 'Better Traffic Flow', desc: 'Distributed arrivals reduce congestion for everyone' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '24px 20px', flex: '1 1 160px', maxWidth: 200 }}>
              <div style={{ width: 56, height: 56, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--accent-blue-light)' }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
              {i < 5 && <div style={{ fontSize: 20, marginTop: 12, color: 'var(--text-muted)' }}>↓</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Events Section */}
      <div id="events" style={{ padding: '0 32px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 800 }}>Upcoming Events</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Live traffic & parking status for all events</p>
          </div>
          <Link to="/events" className="btn btn-secondary">View All Events <ChevronRight size={16} /></Link>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Search events or venues..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.slice(0,6).map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} className="btn btn-sm" style={{ background: category === cat ? 'var(--gradient-accent)' : 'var(--bg-card-hover)', color: category === cat ? '#fff' : 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {cat === 'ALL' ? 'All' : getCategoryIcon(cat) + ' ' + cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="loading-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>No events found</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            {filtered.map(event => {
              const util = calcUtilization(Number(event.total_occupied), Number(event.total_parking));
              const utilizColor = getUtilizationColor(util);
              return (
                <div key={event.id} className="event-card animate-fade" onClick={() => navigate(`/events/${event.id}`)}>
                  <div className="event-card-banner" style={{ background: `linear-gradient(135deg, rgba(59,130,246,0.3), rgba(6,182,212,0.2))`, position: 'relative' }}>
                    <span style={{ fontSize: 56 }}>{getCategoryIcon(event.category)}</span>
                    <div style={{ position: 'absolute', top: 12, right: 12 }}>
                      <TrafficRiskBadge score={Number(event.traffic_risk_score)} />
                    </div>
                  </div>
                  <div className="event-card-body">
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                      {event.category} · {event.manager_name}
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>{event.name}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <Clock size={14} />{formatDate(event.date)} · {formatTime(event.start_time)}–{formatTime(event.end_time)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <MapPin size={14} />{event.venue}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <Users size={14} />{Number(event.expected_attendees).toLocaleString()} attendees · <Car size={14} />{Number(event.estimated_vehicle_count).toLocaleString()} vehicles
                      </div>
                    </div>
                    {Number(event.total_parking) > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                          <span>Parking</span>
                          <span style={{ color: utilizColor, fontWeight: 600 }}>{util}% occupied</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${util}%`, background: utilizColor }} />
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <ParkingBadge available={Number(event.total_available)} total={Number(event.total_parking)} />
                      <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate(`/events/${event.id}`); }}>
                        View Event <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Partner Section */}
      <div style={{ background: 'var(--bg-card)', padding: '80px 32px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, color: 'var(--accent-teal)' }}>
            <Car size={32} />
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Own a Parking Facility?</h2>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, marginBottom: 32, lineHeight: 1.6 }}>
            Partner with Evetramasy to list your parking spaces for major events or general daily booking. 
            Automate your management with our sensor integrations and increase your revenue.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="/owner/register" className="btn btn-primary btn-lg">List Your Space</Link>
            <Link to="/owner/login" className="btn btn-secondary btn-lg">Partner Login</Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        <div className="nav-logo" style={{ marginBottom: 8, fontSize: 18 }}>⚡ Evetramasy</div>
        <div>Intelligent Event Traffic, Parking & Crowd Management System</div>
        <div style={{ marginTop: 8 }}>Chennai, India · © 2026 Evetramasy. All rights reserved.</div>
      </footer>
    </div>
  );
}
