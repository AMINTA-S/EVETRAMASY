import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Zap, ArrowLeft } from 'lucide-react';

export default function OwnerLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      const user = JSON.parse(localStorage.getItem('evetramasy_user') || '{}');
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'MANAGER') navigate('/manager/dashboard');
      else navigate('/customer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: string) => {
    if (role === 'admin') setForm({ email: 'admin@evetramasy.com', password: 'Admin@123' });
    else if (role === 'manager') setForm({ email: 'arun@manager.com', password: 'Manager@123' });
    else setForm({ email: 'ravi@customer.com', password: 'Customer@123' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 32px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Outfit' }} className="gradient-text">⚡ Evetramasy</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 16, marginBottom: 8 }}>Partner Portal</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Sign in to manage your parking facilities</p>
          </div>

          {/* Quick Demo Fill */}
          <div style={{ marginBottom: 20, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Quick Demo Login</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setForm({ email: 'owner@parking.com', password: 'Owner@123' })} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                🅿️ Parking Owner
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 32 }}>
            {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}><span>⚠️ {error}</span></div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="owner@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showPass ? 'text' : 'password'} placeholder="Your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 8 }} disabled={loading}>
                {loading ? '⏳ Signing in...' : '→ Sign In'}
              </button>
            </form>
          </div>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
            Don't have a partner account? <Link to="/owner/register" style={{ color: 'var(--accent-blue-light)', fontWeight: 600 }}>Apply Now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
