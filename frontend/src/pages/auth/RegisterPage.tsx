import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'CUSTOMER' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authAPI.register(form);
      if (form.role === 'MANAGER') {
        setSuccess('Registration submitted! Your account is pending admin approval. You will be notified once approved.');
      } else {
        const { token, user } = res.data;
        localStorage.setItem('evetramasy_token', token);
        localStorage.setItem('evetramasy_user', JSON.stringify(user));
        if (form.role === 'PARKING_OWNER') navigate('/owner/dashboard');
        else navigate('/customer/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>⏳</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Pending Approval</h2>
          <div className="alert alert-info" style={{ marginBottom: 24 }}>{success}</div>
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 32px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Outfit' }} className="gradient-text">⚡ Evetramasy</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 16, marginBottom: 8 }}>Create Account</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Join the smart traffic management platform</p>
          </div>
          <div className="card" style={{ padding: 32 }}>
            {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

            {/* Role Selector */}
            <div style={{ marginBottom: 20 }}>
              <label className="label">I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { val: 'CUSTOMER', icon: '👤', label: 'Attendee', desc: 'I attend events' },
                  { val: 'MANAGER', icon: '🎪', label: 'Event Manager', desc: 'I organize events' },
                ].map(r => (
                  <button key={r.val} type="button" onClick={() => setForm({ ...form, role: r.val })} style={{ padding: '14px', background: form.role === r.val ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.role === r.val ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: 24 }}>{r.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginTop: 4 }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.desc}</div>
                  </button>
                ))}
              </div>
              {form.role === 'MANAGER' && (
                <div className="alert alert-info" style={{ marginTop: 10, fontSize: 12 }}>
                  ℹ️ Manager accounts require admin approval before you can create events.
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Full Name</label>
                <input className="input" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="label">Phone Number</label>
                <input className="input" placeholder="+91 9XXXXXXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 8 }} disabled={loading}>
                {loading ? '⏳ Creating account...' : '→ Create Account'}
              </button>
            </form>
          </div>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-blue-light)', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
