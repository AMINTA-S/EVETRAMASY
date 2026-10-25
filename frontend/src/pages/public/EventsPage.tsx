import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventsAPI } from '../../services/api';
import { getCategoryIcon, formatDate, formatTime, getTrafficBadgeClass, calcUtilization, getUtilizationColor } from '../../utils/helpers';
import { Car, MapPin, Clock, Users, Search, ChevronRight, ArrowLeft } from 'lucide-react';

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

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navbar Minimal */}
      <nav className="navbar" style={{ position: 'sticky', top: 0 }}>
        <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="gradient-text">⚡ Evetramasy</span>
        </div>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
          <ArrowLeft size={16} /> Back Home
        </Link>
      </nav>

      <div style={{ padding: '40px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Explore Events</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Find live events, check traffic impact, and book your parking slot in advance.</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Search events or venues..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 44, borderRadius: 30 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', width: '100%', marginTop: 8 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} className="btn btn-sm" style={{ background: category === cat ? 'var(--gradient-accent)' : 'rgba(255,255,255,0.03)', color: category === cat ? '#fff' : 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {cat === 'ALL' ? 'All Events' : getCategoryIcon(cat) + ' ' + cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="loading-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>No events match your filters</div>
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
                      {event.category}
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>{event.name}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <Clock size={14} />{formatDate(event.date)} · {formatTime(event.start_time)}–{formatTime(event.end_time)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <MapPin size={14} />{event.venue}
                      </div>
                    </div>
                    {Number(event.total_parking) > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                          <span>Parking Fullness</span>
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
                        Details <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
