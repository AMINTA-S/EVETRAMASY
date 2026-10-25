import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavItem { icon: React.ComponentType<{ size?: number }>; label: string; path: string; }

interface SidebarProps { navItems: NavItem[]; role: string; }

export default function Sidebar({ navItems, role }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/'); };

  const roleColor: Record<string, string> = {
    ADMIN: 'var(--accent-purple)',
    MANAGER: 'var(--accent-cyan)',
    CUSTOMER: 'var(--accent-green)'
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Outfit' }} className="gradient-text">⚡ Evetramasy</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Traffic Management System</div>
      </div>

      {/* User Info */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--gradient-accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: roleColor[user?.role || ''], textTransform: 'uppercase', letterSpacing: 0.5 }}>{role}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && item.path !== '/manager/dashboard' && item.path !== '/customer/dashboard' && location.pathname.startsWith(item.path));
          return (
            <button key={item.path} className={`nav-item ${isActive ? 'active' : ''}`} onClick={() => navigate(item.path)}>
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '0 12px 8px' }}>
        <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--accent-red)', width: '100%' }}>
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
