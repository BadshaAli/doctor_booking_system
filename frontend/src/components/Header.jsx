import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import { Menu, Clock, ShieldCheck, UserCheck, Stethoscope, Sparkles } from 'lucide-react';

export const Header = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'BD Doctors Directory & Chamber Booking',
          subtitle: 'Find top specialized doctors across all 64 districts in Bangladesh',
        };
      case '/patient-dashboard':
        return {
          title: 'My Medical Records & Prescriptions',
          subtitle: 'Track your pending, confirmed, and completed consultations',
        };
      case '/doctor-dashboard':
        return {
          title: 'Doctor Chamber Practice Management',
          subtitle: 'Manage patient queues, appointments, and write digital prescriptions',
        };
      case '/admin-dashboard':
        return {
          title: 'AmarDoctor System Administration',
          subtitle: 'Comprehensive oversight of all doctors, patients, appointments, and reviews',
        };
      case '/login':
        return {
          title: 'Authentication & Demo Portals',
          subtitle: 'Sign in with your account or choose a one-click demo user',
        };
      default:
        if (location.pathname.startsWith('/doctor/')) {
          return {
            title: 'Specialist Profile & Available Chamber Slots',
            subtitle: 'Book instant appointments with verified Bangladeshi specialists',
          };
        }
        return {
          title: 'AmarDoctor Platform',
          subtitle: 'আপনার পছন্দের ডাক্তার, আপনার সময়ে',
        };
    }
  };

  const page = getPageInfo();

  return (
    <header className="top-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.5rem', background: '#FFFFFF', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 40 }}>
      {/* Left side: Hamburger Toggle & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Toggle Button for Mobile and Desktop */}
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              if (setIsMobileOpen) setIsMobileOpen(!isMobileOpen);
            } else {
              if (setIsCollapsed) setIsCollapsed(!isCollapsed);
            }
          }}
          className="header-menu-btn"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          style={{
            background: 'var(--bg-app)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '7px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
          }}
        >
          <Menu size={18} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, lineHeight: 1.2 }}>
            {page.title}
          </h1>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {page.subtitle}
          </div>
        </div>
      </div>

      {/* Right side: Status and User Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div
          className="hide-on-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            background: 'var(--bg-app)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--success)' }} />
          <span>AmarDoctor: <strong style={{ color: 'var(--success-text)' }}>BD Live</strong></span>
        </div>

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to={role === 'DOCTOR' ? '/doctor-dashboard' : role === 'ADMIN' ? '/admin-dashboard' : '/patient-dashboard'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '3px 8px 3px 3px',
                borderRadius: '30px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-app)',
                textDecoration: 'none',
              }}
            >
              <Avatar
                firstName={user?.first_name || user?.username}
                name={user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                size={30}
                fontSize={12}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {role === 'DOCTOR' ? `Dr. ${user?.first_name || user?.username}` : user?.first_name || user?.username}
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: role === 'ADMIN' ? '#FEF3C7' : role === 'DOCTOR' ? '#D1FAE5' : '#DBEAFE',
                  color: role === 'ADMIN' ? '#B45309' : role === 'DOCTOR' ? '#047857' : '#1D4ED8',
                }}
              >
                {role}
              </span>
            </Link>
          </div>
        ) : (
          <Link
            to="/login"
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}
          >
            <span>Sign In / Demo</span>
          </Link>
        )}
      </div>
    </header>
  );
};
export default Header;
