import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, User, Calendar, LogOut, ShieldCheck, Stethoscope, ChevronDown } from 'lucide-react';

export const Navbar = () => {
  const { user, role, isAuthenticated, logout, doctorProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand-logo">
          <div style={{
            background: 'linear-gradient(135deg, #0284C7, #0D9488)',
            color: '#fff',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={22} />
          </div>
          <span>MediCare<span style={{ color: 'var(--teal)' }}>Plus</span></span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Find Doctors
          </Link>

          {isAuthenticated && (
            <Link
              to={role === 'DOCTOR' ? '/doctor-dashboard' : '/patient-dashboard'}
              className={`nav-link ${isActive('/doctor-dashboard') || isActive('/patient-dashboard') ? 'active' : ''}`}
            >
              <Calendar size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
              {role === 'DOCTOR' ? 'Doctor Portal' : 'My Appointments'}
            </Link>
          )}

          {/* Demo/premium controls removed for simplified auth UI */}

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt="Avatar"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                    {role === 'DOCTOR' ? `Dr. ${user.first_name || user.username}` : (user.first_name ? `${user.first_name} ${user.last_name}` : user.username)}
                  </div>
                  <span className={`badge ${role === 'DOCTOR' ? 'badge-confirmed' : 'badge-specialty'}`} style={{ fontSize: '0.65rem' }}>
                    {role}
                  </span>
                </div>
              </div>

              <button className="btn btn-outline btn-sm" onClick={logout} title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
