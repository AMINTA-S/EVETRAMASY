import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { facilitiesAPI, reservationsAPI, vehiclesAPI } from '../../services/api';
import { calcUtilization } from '../../utils/helpers';
import { MapPin, Clock, ArrowLeft, Car } from 'lucide-react';

export default function ParkingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [showBooking, setShowBooking] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [form, setForm] = useState({ vehicleId: '', bookingStart: '', bookingEnd: '' });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    facilitiesAPI.getAll().then(res => setFacilities(res.data)).finally(() => setLoading(false));
    if (user && user.role === 'CUSTOMER') {
      vehiclesAPI.getAll().then(res => setVehicles(res.data));
    }
  }, [user]);

  const handleBookClick = (facility: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedFacility(facility);
    setShowBooking(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.bookingStart || !form.bookingEnd) return alert('Please fill all fields');
    setBookingLoading(true);
    try {
      await reservationsAPI.create({
        facility_id: selectedFacility.id,
        vehicle_id: form.vehicleId,
        booking_start: form.bookingStart,
        booking_end: form.bookingEnd,
        parking_type: 'GENERAL'
      });
      alert('Parking reserved successfully!');
      setShowBooking(false);
      navigate('/customer/reservations');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const filtered = facilities.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.address.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header className="navbar">
        <div className="nav-brand">
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit' }} className="gradient-text">⚡ Evetramasy</div>
        </div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/parking" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Parking</Link>
          {!user && <Link to="/login" className="btn btn-primary" style={{ padding: '6px 16px' }}>Sign In</Link>}
          {user && <Link to={`/${user.role.toLowerCase()}/dashboard`} className="btn btn-primary" style={{ padding: '6px 16px' }}>Dashboard</Link>}
        </nav>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}><ArrowLeft size={20}/> Back</Link>
          <h1 style={{ fontSize: 32, margin: 0 }}>General Parking</h1>
        </div>

        <div className="card" style={{ padding: 16, marginBottom: 32 }}>
          <input 
            type="text" className="input" placeholder="Search by area, location, or facility name..." 
            value={search} onChange={e => setSearch(e.target.value)} 
          />
        </div>

        {loading ? (
          <div className="loading-center"><div className="loading-spinner"/></div>
        ) : (
          <div className="grid-3">
            {filtered.map(f => {
              const util = calcUtilization(f.occupied_count, f.total_capacity);
              return (
                <div key={f.id} className="card p-4">
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>{f.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>
                    <MapPin size={14}/> {f.address}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
                    <Clock size={14}/> ₹{f.hourly_rate} / hour
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span>{f.available_spaces} spaces left</span>
                      <span>{Math.round(util)}% full</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: util >= 90 ? 'var(--accent-red)' : util >= 75 ? 'var(--accent-orange)' : 'var(--accent-green)', width: `${util}%` }} />
                    </div>
                  </div>

                  <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={() => handleBookClick(f)} disabled={f.available_spaces <= 0}>
                    {f.available_spaces > 0 ? 'Book a Spot' : 'Full'}
                  </button>
                </div>
              );
            })}
            {filtered.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No parking facilities found.</div>}
          </div>
        )}
      </main>

      {showBooking && selectedFacility && (
        <div className="modal-overlay">
          <div className="modal card" style={{ padding: 24, maxWidth: 400 }}>
            <h2 style={{ marginBottom: 8 }}>Book Parking</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>{selectedFacility.name}</p>
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label className="label">Select Vehicle</label>
                <select className="input" required value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})}>
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.vehicle_number} ({v.model})</option>
                  ))}
                </select>
                {vehicles.length === 0 && (
                  <small style={{ color: 'var(--accent-orange)' }}>No vehicles found. Add one in your dashboard first.</small>
                )}
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Start Time</label>
                  <input type="time" className="input" required value={form.bookingStart} onChange={e => setForm({...form, bookingStart: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="label">End Time</label>
                  <input type="time" className="input" required value={form.bookingEnd} onChange={e => setForm({...form, bookingEnd: e.target.value})} />
                </div>
              </div>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 20 }}>
                Rate: ₹{selectedFacility.hourly_rate}/hour. Overstaying past your end time will result in an automatic fine.
              </small>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowBooking(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={bookingLoading || vehicles.length === 0}>
                  {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
