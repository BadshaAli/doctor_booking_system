import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/Avatar';
import {
  Activity,
  KeyRound,
  ShieldCheck,
  User,
  Stethoscope,
  Sparkles,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

export const Login = () => {
  const { login, register, demoLogin } = useAuth();
  const navigate = useNavigate();

  const showDemoLogins = import.meta.env.VITE_SHOW_DEMO !== 'false';

  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('Internal Medicine');
  const [district, setDistrict] = useState('Dhaka');
  const [hospital, setHospital] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (isRegistering) {
      const success = await register({
        username: username.toLowerCase().replace(/\s+/g, ''),
        password,
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        phone,
        specialty: role === 'DOCTOR' ? specialty : undefined,
        district: role === 'DOCTOR' ? district : undefined,
        hospital: role === 'DOCTOR' ? hospital : undefined,
      });
      setLoading(false);
      if (success) {
        if (role === 'DOCTOR') navigate('/doctor-dashboard');
        else if (role === 'ADMIN') navigate('/admin-dashboard');
        else navigate('/patient-dashboard');
      }
    } else {
      const cleanUser = username.toLowerCase().replace(/\s+/g, '');
      const success = await login(cleanUser, password);
      setLoading(false);
      if (success) {
        navigate('/');
      }
    }
  };

  const handleQuickDemo = async (targetRole, targetUser, redirect) => {
    setLoading(true);
    const ok = await demoLogin(targetRole, targetUser);
    setLoading(false);
    if (ok) {
      navigate(redirect);
    }
  };

  const demoPresets = [
    {
      role: 'PATIENT',
      username: 'rahimuddin',
      name: 'Rahim Uddin',
      location: 'Dhaka',
      desc: 'Hypertension patient with active prescriptions & pending visits',
      badge: 'Patient',
      badgeColor: '#2563EB',
      redirect: '/patient-dashboard',
    },
    {
      role: 'PATIENT',
      username: 'fatemabegum',
      name: 'Fatema Begum',
      location: 'Chittagong',
      desc: 'Pediatric asthma & cardiology consultation history',
      badge: 'Patient',
      badgeColor: '#2563EB',
      redirect: '/patient-dashboard',
    },
    {
      role: 'PATIENT',
      username: 'tanvirahmed',
      name: 'Tanvir Ahmed',
      location: 'Sylhet',
      desc: 'ENT sinus treatment & prescription records',
      badge: 'Patient',
      badgeColor: '#2563EB',
      redirect: '/patient-dashboard',
    },
    {
      role: 'DOCTOR',
      username: 'abmabdullah',
      name: 'Prof. Dr. ABM Abdullah',
      location: 'Dhaka',
      desc: 'National Professor • Medicine specialist chamber',
      badge: 'Doctor',
      badgeColor: '#059669',
      redirect: '/doctor-dashboard',
    },
    {
      role: 'DOCTOR',
      username: 'mustafazaman',
      name: 'Prof. Dr. S.M. Mustafa Zaman',
      location: 'Dhaka',
      desc: 'Senior Cardiologist BSMMU • Patient appointments queue',
      badge: 'Doctor',
      badgeColor: '#059669',
      redirect: '/doctor-dashboard',
    },
    {
      role: 'ADMIN',
      username: 'admin',
      name: 'System Administrator',
      location: 'Bangladesh',
      desc: 'Admin dashboard • All 25 BD doctors, patients & appointments',
      badge: 'Admin',
      badgeColor: '#D97706',
      redirect: '/admin-dashboard',
    },
  ];

  return (
    <div style={{ maxWidth: showDemoLogins ? '960px' : '520px', margin: '1rem auto 3rem', transition: 'max-width 0.2s ease' }}>
      {/* Brand Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #0D9488 100%)',
          borderRadius: '18px',
          padding: '2rem 1.75rem',
          color: '#FFFFFF',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(4px)',
            padding: '5px 14px',
            borderRadius: '30px',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '0.6rem',
          }}
        >
          <Activity size={17} />
          AmarDoctor Bangladesh
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.35rem', letterSpacing: '-0.02em' }}>
          আপনার পছন্দের ডাক্তার, আপনার সময়ে
        </h1>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9, maxWidth: '580px', marginInline: 'auto' }}>
          Connect with 25 top specialized Bangladeshi doctors across all districts.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showDemoLogins ? 'repeat(auto-fit, minmax(340px, 1fr))' : '1fr', gap: '1.75rem' }}>
        {/* Left Side: Standard Login / Register Form */}
        <div className="clinical-card" style={{ padding: '1.75rem' }}>
          {/* Tab Selector */}
          <div
            style={{
              display: 'flex',
              background: '#F1F5F9',
              borderRadius: '10px',
              padding: '4px',
              marginBottom: '1.5rem',
            }}
          >
            <button
              type="button"
              style={{
                flex: 1,
                padding: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                borderRadius: '8px',
                background: !isRegistering ? '#FFFFFF' : 'transparent',
                color: !isRegistering ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: !isRegistering ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
              }}
              onClick={() => setIsRegistering(false)}
            >
              Sign In
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                borderRadius: '8px',
                background: isRegistering ? '#FFFFFF' : 'transparent',
                color: isRegistering ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: isRegistering ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
              }}
              onClick={() => setIsRegistering(true)}
            >
              Register New Account
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Account Role</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['PATIENT', 'DOCTOR'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: role === r ? 'var(--primary)' : 'var(--border-color)',
                        background: role === r ? 'var(--primary-light)' : '#FFFFFF',
                        color: role === r ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      {r === 'DOCTOR' ? '🩺 Doctor' : '👤 Patient'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Username <span style={{ color: '#64748B', fontSize: '0.72rem' }}>(small letters, no spaces)</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. rahimuddin, abmabdullah, admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {isRegistering && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Rahim"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Uddin"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="user@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number (Bangladesh)</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+880 1711-000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {role === 'DOCTOR' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label className="form-label">Specialty</label>
                        <select
                          className="form-input"
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value)}
                        >
                          <option value="Internal Medicine">Internal Medicine</option>
                          <option value="Cardiology">Cardiology</option>
                          <option value="General Surgery">General Surgery</option>
                          <option value="Pediatrics">Pediatrics</option>
                          <option value="Orthopedics">Orthopedics</option>
                          <option value="Neurology">Neurology</option>
                          <option value="Ophthalmology">Ophthalmology</option>
                          <option value="ENT / Otorhinolaryngology">ENT</option>
                          <option value="Dermatology">Dermatology</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">District</label>
                        <select
                          className="form-input"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                        >
                          {['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Mymensingh', 'Barisal', 'Comilla', 'Rangpur', 'Jashore'].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Hospital / Chamber Address</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Square Hospital, Dhaka"
                        value={hospital}
                        onChange={(e) => setHospital(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.75rem', fontWeight: 700 }}
            >
              {loading ? 'Processing...' : isRegistering ? 'Create AmarDoctor Account' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Right Side: Quick One-Click Demo Logins */}
        {showDemoLogins && (
          <div>
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={18} color="var(--primary)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    One-Click Demo Accounts
                  </h3>
                </div>
                <span
                  style={{
                    background: '#EFF6FF',
                    color: '#2563EB',
                    border: '1px solid #BFDBFE',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  Password: bad1234$
                </span>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Click any demo profile below to instantly log in and experience the full AmarDoctor portal:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {demoPresets.map((preset) => (
                  <div
                    key={preset.username}
                    onClick={() => handleQuickDemo(preset.role, preset.username, preset.redirect)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      background: '#F8FAFC',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = preset.badgeColor;
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.background = '#F8FAFC';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <Avatar firstName={preset.name} size={36} fontSize={14} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                            {preset.name}
                          </span>
                          <span
                            style={{
                              fontSize: '0.62rem',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: `${preset.badgeColor}18`,
                              color: preset.badgeColor,
                              fontWeight: 700,
                              border: `1px solid ${preset.badgeColor}40`,
                            }}
                          >
                            {preset.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {preset.desc}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '1px' }}>
                          Username: <strong style={{ color: '#2563EB', fontFamily: 'monospace' }}>{preset.username}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ color: preset.badgeColor, display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Login;
