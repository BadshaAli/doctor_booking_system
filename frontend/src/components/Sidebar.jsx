import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import {
  Activity,
  Users,
  Calendar,
  Stethoscope,
  LogOut,
  User,
  LayoutDashboard,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user, role, isAuthenticated, logout, demoLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeDemoCategory, setActiveDemoCategory] = useState('all');
  const [demoLoadingUser, setDemoLoadingUser] = useState(null);

  const showDemoLogins = import.meta.env.VITE_SHOW_DEMO !== 'false';

  const isActive = (path) => location.pathname === path;


  const handleDemoClick = async (targetRole, username, redirectPath) => {
    setDemoLoadingUser(username);
    const ok = await demoLogin(targetRole, username);
    setDemoLoadingUser(null);
    if (ok) {
      navigate(redirectPath);
      if (setIsMobileOpen) setIsMobileOpen(false);
    }
  };

  const demoAccounts = [
    {
      category: 'patient',
      role: 'PATIENT',
      username: 'rahimuddin',
      name: 'Rahim Uddin',
      info: 'Dhaka • 4 Appointments (1 Completed, 1 Confirmed, 1 Pending)',
      badge: 'Patient',
      badgeColor: '#2563EB',
      redirect: '/patient-dashboard',
    },
    {
      category: 'patient',
      role: 'PATIENT',
      username: 'fatemabegum',
      name: 'Fatema Begum',
      info: 'Chittagong • Child Asthma & Cardio Consultations',
      badge: 'Patient',
      badgeColor: '#2563EB',
      redirect: '/patient-dashboard',
    },
    {
      category: 'patient',
      role: 'PATIENT',
      username: 'tanvirahmed',
      name: 'Tanvir Ahmed',
      info: 'Sylhet • ENT Prescription & Treatment',
      badge: 'Patient',
      badgeColor: '#2563EB',
      redirect: '/patient-dashboard',
    },
    {
      category: 'doctor',
      role: 'DOCTOR',
      username: 'abmabdullah',
      name: 'Prof. Dr. ABM Abdullah',
      info: 'Medicine Specialist • Square Hospital',
      badge: 'Doctor',
      badgeColor: '#059669',
      redirect: '/doctor-dashboard',
    },
    {
      category: 'doctor',
      role: 'DOCTOR',
      username: 'mustafazaman',
      name: 'Prof. Dr. S.M. Mustafa Zaman',
      info: 'Senior Cardiologist • BSMMU Dhaka',
      badge: 'Doctor',
      badgeColor: '#059669',
      redirect: '/doctor-dashboard',
    },
    {
      category: 'doctor',
      role: 'DOCTOR',
      username: 'samantalsen',
      name: 'Dr. Samanta Lal Sen',
      info: 'Plastic & Burn Surgery • National Inst.',
      badge: 'Doctor',
      badgeColor: '#059669',
      redirect: '/doctor-dashboard',
    },
    {
      category: 'admin',
      role: 'ADMIN',
      username: 'admin',
      name: 'System Admin',
      info: 'Full System Oversight • All 25 BD Doctors',
      badge: 'Admin',
      badgeColor: '#D97706',
      redirect: '/admin-dashboard',
    },
  ];

  const filteredDemoAccounts = activeDemoCategory === 'all'
    ? demoAccounts
    : demoAccounts.filter((acc) => acc.category === activeDemoCategory);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            zIndex: 99,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: isCollapsed ? '72px' : '290px',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s ease',
        }}
      >
        {/* Brand Header */}
        <div
          className="sidebar-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '1rem 0.5rem' : '1.1rem 1.1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              overflow: 'hidden',
              textDecoration: 'none',
              minWidth: 0,
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                padding: '8px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
              }}
            >
              <Activity size={22} />
            </div>
            {!isCollapsed && (
              <div style={{ lineHeight: 1.2, minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  Amar<span style={{ color: '#60A5FA' }}>Doctor</span>
                </div>
                <div style={{ fontSize: '0.66rem', color: '#94A3B8', fontWeight: 500, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  আপনার পছন্দের ডাক্তার, আপনার সময়ে
                </div>
              </div>
            )}
          </Link>

          {/* Collapse toggle button for Desktop */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="sidebar-toggle-btn"
              title="Collapse Sidebar"
              style={{
                color: '#94A3B8',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                padding: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginLeft: '6px',
              }}
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Collapsed expansion button */}
        {isCollapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
            <button
              onClick={() => setIsCollapsed(false)}
              className="sidebar-toggle-btn"
              title="Expand Sidebar"
              style={{
                color: '#60A5FA',
                background: 'rgba(37, 99, 235, 0.15)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <div
          className="sidebar-menu"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isCollapsed ? '0.75rem 0.35rem' : '0.85rem 0.85rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {!isCollapsed && (
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#64748B',
                padding: '0.35rem 0.5rem 0.5rem 0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Navigation
            </div>
          )}

          {/* Clean vertical column for main navigation links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.25rem' }}>
            <Link
              to="/"
              className={`sidebar-link ${isActive('/') ? 'active' : ''}`}
              title="BD Doctors Directory"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              }}
            >
              <Users size={19} />
              {!isCollapsed && <span>BD Doctors Directory</span>}
            </Link>

            {isAuthenticated && role === 'PATIENT' && (
              <Link
                to="/patient-dashboard"
                className={`sidebar-link ${isActive('/patient-dashboard') ? 'active' : ''}`}
                title="My Appointments"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                }}
              >
                <Calendar size={19} />
                {!isCollapsed && <span>My Appointments</span>}
              </Link>
            )}

            {isAuthenticated && role === 'DOCTOR' && (
              <Link
                to="/doctor-dashboard"
                className={`sidebar-link ${isActive('/doctor-dashboard') ? 'active' : ''}`}
                title="Doctor Chamber"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                }}
              >
                <LayoutDashboard size={19} />
                {!isCollapsed && <span>Doctor Chamber</span>}
              </Link>
            )}

            {isAuthenticated && role === 'ADMIN' && (
              <Link
                to="/admin-dashboard"
                className={`sidebar-link ${isActive('/admin-dashboard') ? 'active' : ''}`}
                title="Admin Control Panel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                }}
              >
                <ShieldCheck size={19} color="#F59E0B" />
                {!isCollapsed && <span>Admin Control Panel</span>}
              </Link>
            )}

            {!isAuthenticated && (
              <Link
                to="/login"
                className={`sidebar-link ${isActive('/login') ? 'active' : ''}`}
                title="Sign In / Register"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                }}
              >
                <User size={19} />
                {!isCollapsed && <span>Sign In / Register</span>}
              </Link>
            )}
          </div>

          {/* Quick Demo Switcher Section */}
          {showDemoLogins && (
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              {!isCollapsed ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.5rem',
                    marginBottom: '0.4rem',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: '0.85rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#60A5FA',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Sparkles size={12} />
                    Demo Logins
                  </div>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      color: '#94A3B8',
                      background: 'rgba(255,255,255,0.08)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                    }}
                  >
                    Pass: bad1234$
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '1px',
                    background: 'rgba(255,255,255,0.1)',
                    margin: '0.6rem 0',
                  }}
                />
              )}

              {!isCollapsed && (
                <div style={{ display: 'flex', gap: '4px', marginBottom: '0.6rem', padding: '0 0.25rem' }}>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'patient', label: 'Patients' },
                    { id: 'doctor', label: 'Doctors' },
                    { id: 'admin', label: 'Admin' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDemoCategory(tab.id)}
                      style={{
                        flex: 1,
                        padding: '4px 0',
                        fontSize: '0.68rem',
                        fontWeight: activeDemoCategory === tab.id ? 700 : 500,
                        borderRadius: '5px',
                        background: activeDemoCategory === tab.id ? 'rgba(37, 99, 235, 0.35)' : 'rgba(255,255,255,0.04)',
                        color: activeDemoCategory === tab.id ? '#93C5FD' : '#94A3B8',
                        border: activeDemoCategory === tab.id ? '1px solid rgba(96, 165, 250, 0.4)' : '1px solid transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* List of Demo Accounts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {filteredDemoAccounts.map((acc) => (
                  <button
                    key={acc.username}
                    className="sidebar-link demo-user-btn"
                    title={`${acc.name} (${acc.username} / bad1234$)`}
                    onClick={() => handleDemoClick(acc.role, acc.username, acc.redirect)}
                    disabled={demoLoadingUser === acc.username}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: isCollapsed ? '8px 0' : '7px 8px',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      background: user?.username === acc.username ? 'rgba(37, 99, 235, 0.25)' : 'rgba(255,255,255,0.03)',
                      border: user?.username === acc.username ? '1px solid rgba(96, 165, 250, 0.4)' : '1px solid rgba(255,255,255,0.04)',
                      borderRadius: '8px',
                      marginBottom: '2px',
                    }}
                  >
                    <Avatar firstName={acc.name} size={isCollapsed ? 32 : 28} fontSize={isCollapsed ? 13 : 11} />
                    {!isCollapsed && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: '#F8FAFC',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '125px',
                            }}
                          >
                            {acc.name}
                          </span>
                          <span
                            style={{
                              fontSize: '0.62rem',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              backgroundColor: `${acc.badgeColor}22`,
                              color: acc.badgeColor,
                              fontWeight: 700,
                              border: `1px solid ${acc.badgeColor}44`,
                            }}
                          >
                            {acc.badge}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.67rem', color: '#94A3B8' }}>
                          <code style={{ color: '#60A5FA', background: 'rgba(0,0,0,0.25)', padding: '0 3px', borderRadius: '3px' }}>
                            {acc.username}
                          </code>
                          <span>•</span>
                          <span style={{ fontSize: '0.64rem' }}>bad1234$</span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>



        {/* Footer / User Profile */}
        <div
          className="sidebar-footer"
          style={{
            padding: isCollapsed ? '0.85rem 0.5rem' : '0.85rem 1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.25)',
          }}
        >
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                <Avatar
                  firstName={user?.first_name || user?.username}
                  name={user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                  size={36}
                  showStatus={true}
                  statusColor="#10B981"
                />
                {!isCollapsed && (
                  <div style={{ overflow: 'hidden', minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#F8FAFC',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        maxWidth: '130px',
                      }}
                    >
                      {role === 'DOCTOR' ? `Dr. ${user?.first_name || user?.username}` : user?.first_name || user?.username}
                    </div>
                    <div
                      style={{
                        fontSize: '0.68rem',
                        color: role === 'ADMIN' ? '#F59E0B' : role === 'DOCTOR' ? '#34D399' : '#93C5FD',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {role === 'ADMIN' ? '🛡️ Administrator' : role}
                    </div>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <button
                  onClick={logout}
                  style={{
                    color: '#94A3B8',
                    padding: '6px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-primary btn-sm"
              style={{
                width: '100%',
                padding: isCollapsed ? '6px 0' : '7px 12px',
                fontSize: '0.78rem',
                justifyContent: 'center',
                display: 'flex',
              }}
            >
              {isCollapsed ? <User size={16} /> : 'Sign In'}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
