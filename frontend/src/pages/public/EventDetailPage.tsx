import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI, parkingAPI, trafficAPI, reservationsAPI, vehiclesAPI } from '../../services/api';
import { getCategoryIcon, getTrafficBadgeClass, formatDate, formatTime, calcUtilization } from '../../utils/helpers';
import { Car, MapPin, Clock, Users, ArrowLeft, Ticket, Shield, AlertTriangle, Navigation, Map as MapIcon, ChevronRight } from 'lucide-react';
import EventMap from '../../components/maps/EventMap';

function TrafficRiskBadge({ score }: { score: number }) {
  const level = score <= 25 ? 'LOW' : score <= 50 ? 'MODERATE' : score <= 75 ? 'HIGH' : 'SEVERE';
  const cls = getTrafficBadgeClass(level);
  const icon = score > 75 ? '🔴' : score > 50 ? '🟠' : score > 25 ? '🟡' : '🟢';
  return <span className={`badge ${cls}`}>{icon} {level}</span>;
}

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<any>(null);
  const [parkingZones, setParkingZones] = useState<any[]>([]);
  const [trafficZones, setTrafficZones] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [showBooking, setShowBooking] = useState(false);
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      eventsAPI.getById(id),
      parkingAPI.getZones(id),
      trafficAPI.getZones(id)
    ]).then(([eRes, pRes, tRes]) => {
      setEvent(eRes.data);
      setParkingZones(pRes.data);
      setTrafficZones(tRes.data);
    }).catch(() => {
      navigate('/events');
    }).finally(() => setLoading(false));

    if (user && user.role === 'CUSTOMER') {
      vehiclesAPI.getAll().then(res => setVehicles(res.data)).catch(console.error);
    }
  }, [id, user, navigate]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZone || !selectedVehicle) return alert('Please select zone and vehicle');
    setBookingLoading(true);
    try {
      await reservationsAPI.create({ event_id: id!, parking_zone_id: selectedZone, vehicle_id: selectedVehicle });
      setBookingSuccess(true);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading || !event) return <div className="loading-center"><div className="loading-spinner"/></div>;

  const totalParking = Number(event.total_parking);
  const totalOccupied = Number(event.total_occupied);
  const totalAvailable = Number(event.total_available);
  const util = calcUtilization(totalOccupied, totalParking);
  
  // Basic risk analysis for UI text
  const risk = Number(event.traffic_risk_score);
  const riskText = risk > 75 ? 'Severe congestion expected. Pre-book parking mandatory. Leave 60 mins early.' :
                   risk > 50 ? 'Moderate traffic likely. Plan route in advance.' :
                   'Light traffic expected. Normal travel time.';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar Minimal */}
      <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="gradient-text">⚡ Evetramasy</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
            <ArrowLeft size={16} /> All Events
          </Link>
          {user ? (
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/${user.role.toLowerCase()}/dashboard`)}>Dashboard</button>
          ) : (
            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
          )}
        </div>
      </nav>

      <div style={{ flex: 1, padding: '32px', maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Header Block */}
        <div className="card" style={{ padding: 40, background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.05))', border: '1px solid rgba(59,130,246,0.2)' }}>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span style={{ fontSize: 32 }}>{getCategoryIcon(event.category)}</span>
                <span className="badge badge-blue">{event.category}</span>
                <TrafficRiskBadge score={risk} />
              </div>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: 16, lineHeight: 1.1 }}>{event.name}</h1>
              <div className="flex flex-wrap gap-x-8 gap-y-3 text-secondary">
                <div className="flex items-center gap-2"><Clock size={16}/> {formatDate(event.date)} · {formatTime(event.start_time)} – {formatTime(event.end_time)}</div>
                <div className="flex items-center gap-2"><MapPin size={16}/> {event.venue}</div>
                <div className="flex items-center gap-2"><Users size={16}/> {Number(event.expected_attendees).toLocaleString()} expected</div>
              </div>
            </div>
            
            <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 16, border: '1px solid var(--border)', minWidth: 280 }}>
              <div className="text-sm text-muted mb-1 text-center font-semibold uppercase tracking-wide">Live Parking Status</div>
              <div className="text-center font-outfit text-3xl font-bold mb-4" style={{ color: util > 90 ? '#ef4444' : util > 75 ? '#f97316' : '#22c55e' }}>
                {totalAvailable} spaces left
              </div>
              <div className="progress-bar mb-6" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: `${util}%`, background: util > 90 ? '#ef4444' : util > 75 ? '#f97316' : '#22c55e' }} />
              </div>
              <button className="btn btn-primary w-full justify-center" onClick={() => user ? setShowBooking(true) : navigate('/login')} disabled={totalAvailable <= 0}>
                {user ? <><Ticket size={18}/> Reserve Parking Space</> : 'Login to Book Parking'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
          
          {/* Main Content */}
          <div className="flex-col gap-6">
            <div className="card" style={{ padding: 0, overflow: 'hidden', height: 400 }}>
              {/* Note: In a real app we'd load the map fully interactively */}
              <EventMap event={event} parkingZones={parkingZones} trafficZones={trafficZones} />
            </div>
            
            <div className="card">
              <h3 className="mb-4 text-xl">Parking Zones</h3>
              <div className="grid-2">
                {parkingZones.map(pz => (
                  <div key={pz.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-semibold text-lg">{pz.name}</div>
                      <span className={`badge ${pz.status==='OPEN' || pz.status==='AVAILABLE'?'badge-available':pz.status==='FULL'?'badge-full':'badge-default'}`}>{pz.status}</span>
                    </div>
                    <div className="text-sm text-muted mb-4">Capacity: {pz.capacity} · Available: {pz.available_spaces}</div>
                    <div className="text-xs text-secondary bg-white/5 p-2 rounded">Entry Gate: <strong>{pz.entry_gate}</strong></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="flex-col gap-6">
            <div className="card">
              <h3 className="mb-4 flex items-center gap-2"><Shield size={18} className="text-blue-400"/> Event Intelligence</h3>
              <div className="alert alert-info mb-4" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="font-semibold mb-1">Traffic Impact Analysis</span>
                <span className="text-sm">{riskText}</span>
              </div>
              <p className="text-sm text-secondary leading-relaxed">{event.description}</p>
            </div>

            <div className="card">
              <h3 className="mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-yellow-400"/> Live Traffic Zones</h3>
              <div className="flex-col gap-3">
                {trafficZones.length === 0 ? <div className="text-sm text-muted">No specific traffic zones configured.</div> : trafficZones.map(tz => (
                  <div key={tz.id} className="p-3 rounded-lg border border-white/5 bg-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-sm">{tz.road_name}</span>
                      <span className={`badge badge-${tz.traffic_status.toLowerCase()}`}>{tz.traffic_status}</span>
                    </div>
                    <div className="text-xs text-muted">{tz.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="modal-overlay" onClick={() => setShowBooking(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reserve Parking</h3>
              <button onClick={() => setShowBooking(false)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize: 20 }}>×</button>
            </div>
            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                <h3 className="text-xl font-bold mb-2">Parking Reserved!</h3>
                <p className="text-secondary mb-6">Your QR pass is ready in your dashboard.</p>
                <button className="btn btn-primary w-full justify-center" onClick={() => navigate('/customer/reservations')}>View My Pass</button>
              </div>
            ) : (
              <form onSubmit={handleBook}>
                <div className="form-group">
                  <label className="label">Select Parking Zone</label>
                  <select className="input select" value={selectedZone} onChange={e => setSelectedZone(e.target.value)} required>
                    <option value="">-- Choose a zone --</option>
                    {parkingZones.filter(pz => pz.status === 'OPEN' || pz.status === 'AVAILABLE').map(pz => (
                      <option key={pz.id} value={pz.id}>{pz.name} ({pz.available_spaces} left)</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Select Vehicle</label>
                  {vehicles.length === 0 ? (
                    <div className="alert alert-warning text-sm">
                      You haven't registered any vehicles. <Link to="/customer/vehicles" className="font-bold underline ml-1">Add one first.</Link>
                    </div>
                  ) : (
                    <select className="input select" value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} required>
                      <option value="">-- Choose your vehicle --</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.vehicle_number} ({v.model})</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="alert alert-info text-sm mb-6">
                  By booking, you agree to follow the designated route provided to you via the Live Travel page to minimize congestion.
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowBooking(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={bookingLoading || vehicles.length===0}>
                    {bookingLoading ? 'Processing...' : 'Confirm Reservation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
