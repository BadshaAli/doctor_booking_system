import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { Avatar } from '../components/Avatar';
import { DoctorAdminModal } from '../components/DoctorAdminModal';
import {

  Users, UserCheck, Calendar, ClipboardList, Star, TrendingUp,
  Search, Trash2, CheckCircle, XCircle, Clock, AlertCircle,
  ChevronDown, Activity, MapPin, DollarSign, RefreshCw, Eye, ShieldCheck,
  Percent, ArrowUpRight, Award, FileText, Sparkles, Filter, Radio, CheckCircle2
} from 'lucide-react';

const API = API_BASE_URL;

const STATUS_COLORS = {
  PENDING:   { bg: '#fff8e1', text: '#f59e0b', border: '#fde68a' },
  CONFIRMED: { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' },
  COMPLETED: { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' },
  CANCELLED: { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: '6px', padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em'
    }}>
      {status}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, color, sub, highlight = false, badgeText }) => (
  <div style={{
    background: highlight ? 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)' : '#fff',
    color: highlight ? '#fff' : 'inherit',
    borderRadius: '14px', padding: '1.4rem 1.6rem',
    boxShadow: highlight ? '0 4px 16px rgba(6, 95, 70, 0.28)' : '0 1px 6px rgba(0,0,0,0.07)',
    display: 'flex', alignItems: 'center', gap: '1.1rem',
    border: highlight ? '1px solid #047857' : '1px solid #f0f0f0',
    flex: '1 1 200px', minWidth: 0, position: 'relative'
  }}>
    {badgeText && (
      <span style={{
        position: 'absolute', top: '10px', right: '12px',
        background: highlight ? 'rgba(255,255,255,0.2)' : color + '18',
        color: highlight ? '#A7F3D0' : color,
        border: `1px solid ${highlight ? 'rgba(255,255,255,0.3)' : color + '40'}`,
        borderRadius: '20px', padding: '1px 8px', fontSize: '0.65rem', fontWeight: 800
      }}>
        {badgeText}
      </span>
    )}
    <div style={{
      width: 48, height: 48, borderRadius: '12px',
      background: highlight ? 'rgba(255,255,255,0.2)' : color + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      <Icon size={22} color={highlight ? '#34D399' : color} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '1.65rem', fontWeight: 800, color: highlight ? '#fff' : '#111', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: highlight ? '#D1FAE5' : '#666', marginTop: '4px', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: highlight ? '#6EE7B7' : color, marginTop: '2px', fontWeight: 700 }}>{sub}</div>}
    </div>
  </div>
);

export function AdminDashboard() {
  const { token, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apptSearch, setApptSearch] = useState('');
  const [apptStatus, setApptStatus] = useState('All');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorDistrict, setDoctorDistrict] = useState('All');
  const [doctorSort, setDoctorSort] = useState('revenue');
  const [patientSearch, setPatientSearch] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [isLiveSyncActive, setIsLiveSyncActive] = useState(true);
  const [settledDoctors, setSettledDoctors] = useState({});
  const [inspectingDoctor, setInspectingDoctor] = useState(null);

  const headers = { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' };


  // Fetch stats function
  const fetchStats = useCallback(async (isSilent = false) => {
    try {
      const res = await fetch(`${API}/admin/stats/`, { headers });
      if (res.ok) {
        setStats(await res.json());
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error('Real-time sync error (stats):', err);
    }
  }, [token]);

  // Fetch appointments function
  const fetchAppointments = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (apptStatus !== 'All') params.set('status', apptStatus);
      if (apptSearch) params.set('search', apptSearch);
      const res = await fetch(`${API}/admin/appointments/?${params}`, { headers });
      if (res.ok) setAppointments(await res.json());
    } catch (err) {
      console.error('Real-time sync error (appointments):', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [token, apptSearch, apptStatus]);

  // Fetch doctors function
  const fetchDoctors = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (doctorSearch) params.set('search', doctorSearch);
      if (doctorDistrict !== 'All') params.set('district', doctorDistrict);
      const res = await fetch(`${API}/admin/doctors/?${params}`, { headers });
      if (res.ok) setDoctors(await res.json());
    } catch (err) {
      console.error('Real-time sync error (doctors):', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [token, doctorSearch, doctorDistrict]);

  const fetchPatients = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (patientSearch) params.set('search', patientSearch);
      const res = await fetch(`${API}/admin/patients/?${params}`, { headers });
      if (res.ok) setPatients(await res.json());
    } catch (err) {
      console.error('Real-time sync error (patients):', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [token, patientSearch]);

  const fetchReviews = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch(`${API}/admin/reviews/`, { headers });
      if (res.ok) setReviews(await res.json());
    } catch (err) {
      console.error('Real-time sync error (reviews):', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [token]);

  // Initial load when tab changes
  useEffect(() => {
    fetchStats();
    if (activeTab === 'appointments') fetchAppointments();
    if (activeTab === 'doctors') fetchDoctors();
    if (activeTab === 'patients') fetchPatients();
    if (activeTab === 'reviews') fetchReviews();
  }, [activeTab, fetchStats, fetchAppointments, fetchDoctors, fetchPatients, fetchReviews]);

  // REAL-TIME AUTO SYNC POLLER (Runs every 3.5 seconds)
  useEffect(() => {
    if (!isLiveSyncActive) return;

    const interval = setInterval(() => {
      fetchStats(true);
      if (activeTab === 'overview' || activeTab === 'doctors') fetchDoctors(true);
      if (activeTab === 'appointments') fetchAppointments(true);
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveSyncActive, activeTab, fetchStats, fetchDoctors, fetchAppointments]);

  const updateApptStatus = async (id, newStatus) => {
    const res = await fetch(`${API}/admin/appointments/${id}/`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      showToast(`Appointment #${id} updated to ${newStatus}`, 'success');
      fetchAppointments();
      fetchStats();
      fetchDoctors(true);
    } else {
      showToast('Failed to update status', 'error');
    }
  };

  const togglePatientActive = async (id) => {
    const res = await fetch(`${API}/admin/patients/${id}/`, { method: 'PATCH', headers });
    if (res.ok) {
      const data = await res.json();
      showToast(data.message, 'success');
      fetchPatients();
    }
  };

  const deleteDoctor = async (id, name) => {
    if (!window.confirm(`Remove Dr. ${name} from the system? This cannot be undone.`)) return;
    const res = await fetch(`${API}/admin/doctors/${id}/`, { method: 'DELETE', headers });
    if (res.ok) {
      showToast('Doctor removed successfully', 'success');
      fetchDoctors();
      fetchStats();
    }
  };

  const toggleDailySettlement = (docId) => {
    setSettledDoctors(prev => {
      const updated = { ...prev, [docId]: !prev[docId] };
      showToast(updated[docId] ? 'Marked daily 10% commission as SETTLED' : 'Marked daily commission as UNPAID / DUE', 'info');
      return updated;
    });
  };

  // Sort doctors based on selection
  const sortedDoctors = [...doctors].sort((a, b) => {
    if (doctorSort === 'revenue') return (b.gross_revenue || 0) - (a.gross_revenue || 0);
    if (doctorSort === 'prescriptions') return (b.prescribed_count || 0) - (a.prescribed_count || 0);
    if (doctorSort === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (doctorSort === 'fee') return (b.consultation_fee || 0) - (a.consultation_fee || 0);
    return 0;
  });

  const tabs = [
    { id: 'overview',      label: 'Real-Time Revenue & Overview',  icon: Activity },
    { id: 'doctors',       label: 'Doctor Practice & 10% Fee (Daily)', icon: UserCheck },
    { id: 'appointments',  label: 'Live Appointments Queue',      icon: Calendar },
    { id: 'patients',      label: 'Patients Directory',           icon: Users },
    { id: 'reviews',       label: 'Reviews & Feedback',           icon: Star },
  ];

  return (
    <div style={{ padding: '0 0 2rem' }}>

      {/* Real-Time Live Sync Status Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 55%, #0D9488 100%)',
        borderRadius: '16px', padding: '1.5rem 1.8rem', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff',
        boxShadow: '0 6px 20px rgba(37, 99, 235, 0.2)', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ShieldCheck size={26} color="#FBBF24" />
            <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>AmarDoctor Admin Dashboard</h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
            আপনার পছন্দের ডাক্তার • Real-Time Doctor Income &amp; 10% Daily Commission Settlement
          </p>
        </div>

        {/* Real-Time Live Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(6px)',
            padding: '6px 14px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isLiveSyncActive ? '#10B981' : '#F59E0B',
              boxShadow: isLiveSyncActive ? '0 0 8px #10B981' : 'none',
              animation: isLiveSyncActive ? 'pulse 1.8s infinite' : 'none'
            }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isLiveSyncActive ? '#A7F3D0' : '#FDE68A' }}>
              {isLiveSyncActive ? '🟢 Live Real-Time Sync' : 'Paused'}
            </span>
            <span style={{ fontSize: '0.7rem', opacity: 0.75 }}>
              ({lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
            </span>
          </div>

          <button
            onClick={() => {
              fetchStats();
              if (activeTab === 'doctors' || activeTab === 'overview') fetchDoctors();
              if (activeTab === 'appointments') fetchAppointments();
              showToast('Synced latest data', 'info');
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#FFF', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <RefreshCw size={13} /> Sync
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{
        display: 'flex', gap: '6px', background: '#f3f4f6', borderRadius: '12px',
        padding: '5px', marginBottom: '1.6rem', overflowX: 'auto'
      }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.83rem', transition: 'all 0.15s',
            background: activeTab === id ? '#fff' : 'transparent',
            color: activeTab === id ? '#1a56db' : '#555',
            boxShadow: activeTab === id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
          }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB (REAL-TIME UPDATES) ── */}
      {activeTab === 'overview' && stats && (
        <div>
          {/* Section: Platform Revenue & Daily 10% Settlement Deck */}
          <div style={{
            background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem',
            border: '1px solid #E2E8F0', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#059669" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Real-Time Income &amp; 10% Platform Fee Summary
                </h2>
              </div>
              <span style={{
                background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0',
                padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800
              }}>
                Daily Basis Settlement Model
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {/* Gross Revenue */}
              <StatCard
                icon={DollarSign}
                label="Total Gross Doctor Billings"
                value={`৳${Number(stats.total_gross_revenue || 0).toLocaleString()}`}
                color="#2563EB"
                sub={`${stats.completed_appointments} Completed Consultations`}
              />

              {/* 10% Platform Fee - HIGHLIGHTED */}
              <StatCard
                icon={Percent}
                label="AmarDoctor 10% Site Cut"
                value={`৳${Number(stats.total_platform_commission || 0).toLocaleString()}`}
                color="#10B981"
                sub="10% Net Platform Revenue"
                highlight={true}
                badgeText="10% Fee"
              />

              {/* Doctor 90% Net Payout */}
              <StatCard
                icon={Award}
                label="Doctor Net Disbursements (90%)"
                value={`৳${Number(stats.total_doctor_payouts || 0).toLocaleString()}`}
                color="#7C3AED"
                sub="Paid out to doctors"
              />

              {/* Total Prescriptions */}
              <StatCard
                icon={FileText}
                label="Total Prescribed Patients"
                value={stats.total_prescriptions}
                color="#D97706"
                sub="Digital prescriptions issued"
              />
            </div>

            {/* Daily Today Row */}
            <div style={{
              marginTop: '1rem',
              padding: '0.85rem 1.2rem',
              background: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1E293B', fontWeight: 700 }}>
                <Clock size={16} color="#2563EB" /> Today's Real-Time Daily Activity:
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span>Today's Billings: <strong style={{ color: '#111' }}>৳{Number(stats.today_gross_revenue || 0).toLocaleString()}</strong></span>
                <span>Today's 10% Site Cut: <strong style={{ color: '#047857' }}>+৳{Number(stats.today_platform_commission || 0).toLocaleString()}</strong></span>
                <span>Today's Appointments: <strong style={{ color: '#2563EB' }}>{stats.today_appointments || 0}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <StatCard icon={UserCheck} label="Verified BMDC Doctors" value={stats.total_doctors} color="#1a56db" sub={`${stats.district_counts?.length} BD Districts`} />
            <StatCard icon={Users} label="Registered Patients" value={stats.total_patients} color="#7c3aed" />
            <StatCard icon={Calendar} label="Live Total Consultations" value={stats.total_appointments} color="#0891b2" sub={`${stats.pending_appointments} pending doctor confirm`} />
            <StatCard icon={Star} label="Patient Ratings" value={stats.total_reviews} color="#f59e0b" />
          </div>

          {/* Top Earning Doctors Leaderboard */}
          <div style={{
            background: '#fff', borderRadius: '14px', padding: '1.4rem 1.6rem',
            boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0', marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="#10B981" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111', margin: 0 }}>
                  Real-Time Doctor Earnings &amp; 10% Platform Cut
                </h3>
              </div>
              <button onClick={() => setActiveTab('doctors')} style={{
                background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE',
                borderRadius: '8px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
              }}>
                View Full Doctor Financials →
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700 }}>Doctor</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700 }}>Specialty</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>Prescribed Patients</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>Gross Made (৳)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#047857' }}>Site Cut (10% ৳)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#4338CA' }}>Doctor Net (90% ৳)</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.top_earning_doctors?.map((doc, idx) => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: 20, height: 20, borderRadius: '50%', background: idx === 0 ? '#FEF3C7' : '#F1F5F9',
                            color: idx === 0 ? '#B45309' : '#64748B', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800
                          }}>#{idx + 1}</span>
                          <Avatar firstName={doc.first_name || doc.name} size={28} fontSize={11} />
                          <div>
                            <strong style={{ color: '#111' }}>{doc.name}</strong>
                            <div style={{ fontSize: '0.7rem', color: '#888' }}>{doc.district}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#555' }}>{doc.specialty}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{
                          background: doc.prescribed_count > 0 ? '#ECFDF5' : '#F1F5F9',
                          color: doc.prescribed_count > 0 ? '#047857' : '#64748B',
                          padding: '2px 8px', borderRadius: '12px', fontWeight: 700, fontSize: '0.75rem'
                        }}>
                          {doc.prescribed_count} prescribed
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#111' }}>
                        ৳{doc.gross_revenue?.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#047857' }}>
                        +৳{doc.platform_fee_10?.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#4338CA' }}>
                        ৳{doc.doctor_net_payout?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── DOCTORS TAB: WITH DAILY BASIS SETTLEMENT & REAL-TIME REVENUE ── */}
      {activeTab === 'doctors' && (
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.4rem 1.6rem', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111', margin: 0 }}>
              Individual Doctor Income &amp; 10% Daily Settlement Tracker
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Doctors settle the 10% platform fee on a daily basis
            </div>
          </div>

          {/* Filter Bar: Search, District Filter, Sort selector */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
              <input
                placeholder="Search by doctor name, specialty, hospital..."
                value={doctorSearch}
                onChange={e => setDoctorSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.83rem', boxSizing: 'border-box' }}
              />
            </div>

            <select
              value={doctorDistrict}
              onChange={e => setDoctorDistrict(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.83rem', background: '#fff', cursor: 'pointer' }}
            >
              <option value="All">All Districts</option>
              {['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Mymensingh', 'Barisal', 'Comilla', 'Rangpur', 'Jashore'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Sort:</span>
              <select
                value={doctorSort}
                onChange={e => setDoctorSort(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.83rem', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                <option value="revenue">💰 Highest Revenue</option>
                <option value="prescriptions">📝 Most Patients Prescribed</option>
                <option value="rating">⭐ Highest Rating</option>
                <option value="fee">🏷️ Consultation Fee</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>Doctor Profile</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Specialty</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#374151' }}>Fee</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#374151' }}>Patients Prescribed</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#374151' }}>Gross Made</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#047857', background: '#ECFDF5' }}>Site Cut (10%)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#4338CA' }}>Doctor Net (90%)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#374151' }}>Daily Settlement</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>Loading doctors...</td></tr>}
                {!loading && sortedDoctors.length === 0 && <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>No doctors found</td></tr>}
                {sortedDoctors.map(doc => {
                  const isSettled = settledDoctors[doc.id];
                  return (
                    <tr key={doc.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <Avatar firstName={doc.user_first_name || 'Dr'} size={34} fontSize={13} />
                          <div>
                            <div style={{ fontWeight: 700, color: '#111' }}>
                              Dr. {doc.user_first_name} {doc.user_last_name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#888' }}>{doc.hospital}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, color: '#1a56db' }}>{doc.specialty}</div>
                        <span style={{
                          background: '#f0f7ff', color: '#1a56db', borderRadius: '4px',
                          padding: '1px 6px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-block', marginTop: '2px'
                        }}>{doc.district}</span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#555' }}>
                        ৳{parseFloat(doc.consultation_fee).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{
                            background: (doc.prescribed_count || 0) > 0 ? '#D1FAE5' : '#F1F5F9',
                            color: (doc.prescribed_count || 0) > 0 ? '#047857' : '#64748B',
                            borderRadius: '12px', padding: '2px 10px', fontWeight: 800, fontSize: '0.78rem'
                          }}>
                            {doc.prescribed_count || 0} Prescriptions
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#888', marginTop: '2px' }}>
                            {doc.completed_appointments_count || 0} completed visits
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#111', fontSize: '0.9rem' }}>
                        ৳{(doc.gross_revenue || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#047857', background: '#ECFDF5', fontSize: '0.9rem' }}>
                        +৳{(doc.platform_fee_10 || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#4338CA', fontSize: '0.85rem' }}>
                        ৳{(doc.doctor_net_payout || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <button
                          onClick={() => toggleDailySettlement(doc.id)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: `1px solid ${isSettled ? '#86EFAC' : '#FDE68A'}`,
                            background: isSettled ? '#DCFCE7' : '#FEF3C7',
                            color: isSettled ? '#15803D' : '#B45309',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          {isSettled ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {isSettled ? 'Daily Settled' : 'Due Daily'}
                        </button>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            onClick={() => setInspectingDoctor(doc)}
                            title="Inspect individual doctor information, contact details, and financial ledger"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              padding: '4px 8px', borderRadius: '6px', border: '1px solid #BFDBFE', cursor: 'pointer',
                              background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.72rem', fontWeight: 700
                            }}
                          >
                            <Eye size={12} /> Inspect
                          </button>
                          <button onClick={() => deleteDoctor(doc.id, `${doc.user_first_name} ${doc.user_last_name}`)} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '4px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                            background: '#fee2e2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 600
                          }}>
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── APPOINTMENTS TAB (REAL-TIME STATUS CONFIRMATION & COMPLETION) ── */}
      {activeTab === 'appointments' && (
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.4rem 1.6rem', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111', margin: 0 }}>
              Live Patient Appointments &amp; Prescriptions Queue ({appointments.length})
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Updates instantly when patients book or doctors confirm
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
              <input
                placeholder="Search patient or doctor..."
                value={apptSearch}
                onChange={e => setApptSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.83rem', boxSizing: 'border-box' }}
              />
            </div>
            {['All', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => (
              <button key={s} onClick={() => setApptStatus(s)} style={{
                padding: '7px 14px', borderRadius: '8px', border: '1px solid',
                borderColor: apptStatus === s ? '#1a56db' : '#e5e7eb',
                background: apptStatus === s ? '#1a56db' : '#fff',
                color: apptStatus === s ? '#fff' : '#555',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
              }}>{s}</button>
            ))}
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #f0f0f0' }}>
                  {['#ID', 'Patient', 'Doctor', 'Date & Time', 'Symptoms / Rx', 'Fee (10% Cut)', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>Loading appointments...</td></tr>
                )}
                {!loading && appointments.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>No appointments found</td></tr>
                )}
                {appointments.map(appt => {
                  const patName = appt.patient_name || appt.patient?.first_name || appt.patient?.username || 'Patient';
                  const docName = appt.doctor_name || appt.doctor?.user?.first_name || 'Doctor';
                  const fee = parseFloat(appt.doctor?.consultation_fee || 0);
                  const fee10 = fee * 0.10;
                  return (
                    <tr key={appt.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 12px', color: '#666', fontWeight: 600 }}>#{appt.id}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar firstName={patName} size={28} fontSize={11} />
                          <div style={{ fontWeight: 600, color: '#111' }}>{patName}</div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar firstName={docName} size={28} fontSize={11} />
                          <div>
                            <div style={{ fontWeight: 600, color: '#1a56db' }}>Dr. {docName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#888' }}>{appt.doctor_specialty}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600 }}>{appt.date}</div>
                        <div style={{ fontSize: '0.72rem', color: '#888' }}>{appt.time_slot}</div>
                      </td>
                      <td style={{ padding: '10px 12px', maxWidth: 180 }}>
                        <div style={{ color: '#555', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {appt.symptoms}
                        </div>
                        {appt.prescription && (
                          <div style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle size={11} /> Rx Prescribed
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: '#111' }}>৳{fee.toLocaleString()}</div>
                        <div style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 700 }}>+৳{fee10.toLocaleString()} (10%)</div>
                      </td>
                      <td style={{ padding: '10px 12px' }}><StatusBadge status={appt.status} /></td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {appt.status !== 'CONFIRMED' && appt.status !== 'COMPLETED' && (
                            <button onClick={() => updateApptStatus(appt.id, 'CONFIRMED')} title="Confirm" style={{
                              padding: '4px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                              background: '#e0f2fe', color: '#0284c7', fontSize: '0.72rem', fontWeight: 600
                            }}>✓ Confirm</button>
                          )}
                          {appt.status !== 'COMPLETED' && (
                            <button onClick={() => updateApptStatus(appt.id, 'COMPLETED')} title="Complete" style={{
                              padding: '4px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                              background: '#dcfce7', color: '#16a34a', fontSize: '0.72rem', fontWeight: 600
                            }}>✓ Done</button>
                          )}
                          {appt.status !== 'CANCELLED' && (
                            <button onClick={() => updateApptStatus(appt.id, 'CANCELLED')} title="Cancel" style={{
                              padding: '4px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                              background: '#fee2e2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 600
                            }}>✕ Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PATIENTS TAB ── */}
      {activeTab === 'patients' && (
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.4rem 1.6rem', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111', margin: 0 }}>
              Registered Patients Directory ({patients.length})
            </h2>
          </div>

          <div style={{ position: 'relative', marginBottom: '1.2rem', maxWidth: 360 }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
            <input
              placeholder="Search by name, username, email..."
              value={patientSearch}
              onChange={e => setPatientSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.83rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #f0f0f0' }}>
                  {['Patient', 'Username', 'Contact', 'Appointments', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>Loading patients...</td></tr>}
                {!loading && patients.length === 0 && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>No patients found</td></tr>}
                {patients.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6', opacity: p.is_active ? 1 : 0.5 }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar firstName={p.full_name || p.username} size={30} fontSize={12} />
                        <div style={{ fontWeight: 700, color: '#111' }}>{p.full_name}</div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#555', fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.username}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.78rem', color: '#555' }}>{p.email || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#888' }}>{p.phone || '—'}</div>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{
                        background: '#f0f7ff', color: '#1a56db', borderRadius: '20px',
                        padding: '2px 10px', fontWeight: 700, fontSize: '0.8rem'
                      }}>{p.total_appointments}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#888', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {new Date(p.date_joined).toLocaleDateString('en-GB')}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        background: p.is_active ? '#dcfce7' : '#fee2e2',
                        color: p.is_active ? '#16a34a' : '#dc2626',
                        borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700
                      }}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <button onClick={() => togglePatientActive(p.id)} style={{
                        padding: '5px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                        background: p.is_active ? '#fee2e2' : '#dcfce7',
                        color: p.is_active ? '#dc2626' : '#16a34a',
                        fontSize: '0.75rem', fontWeight: 600
                      }}>
                        {p.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── REVIEWS TAB ── */}
      {activeTab === 'reviews' && (
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.4rem 1.6rem', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111', margin: 0 }}>
              Patient Feedback &amp; Reviews ({reviews.length})
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {loading && <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>Loading reviews...</div>}
            {!loading && reviews.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>No reviews yet</div>}
            {reviews.map(rv => {
              const patName = rv.patient_name || rv.patient?.first_name || rv.patient?.username || 'Patient';
              const docName = rv.doctor_name || rv.doctor?.user?.first_name || 'Doctor';
              return (
                <div key={rv.id} style={{
                  border: '1px solid #f0f0f0', borderRadius: '12px', padding: '1rem 1.2rem',
                  display: 'flex', alignItems: 'flex-start', gap: '1rem'
                }}>
                  <Avatar firstName={patName} size={38} fontSize={15} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, color: '#111', fontSize: '0.85rem' }}>
                        {patName}
                      </span>
                      <span style={{ color: '#aaa', fontSize: '0.75rem' }}>→ Dr. {docName}</span>
                      <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem' }}>
                        {'★'.repeat(rv.rating)}{'☆'.repeat(5 - rv.rating)}
                      </span>
                      <span style={{
                        background: rv.rating >= 4 ? '#dcfce7' : rv.rating >= 3 ? '#fff8e1' : '#fee2e2',
                        color: rv.rating >= 4 ? '#16a34a' : rv.rating >= 3 ? '#f59e0b' : '#dc2626',
                        borderRadius: '6px', padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700
                      }}>{rv.rating}/5</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#555', lineHeight: 1.5 }}>{rv.comment}</p>
                    <div style={{ fontSize: '0.72rem', color: '#bbb', marginTop: '4px' }}>
                      {new Date(rv.created_at).toLocaleString('en-GB')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Admin Doctor Inspector Modal */}
      {inspectingDoctor && (
        <DoctorAdminModal
          doctor={inspectingDoctor}
          onClose={() => setInspectingDoctor(null)}
          onSettlementToggle={toggleDailySettlement}
          isSettled={settledDoctors[inspectingDoctor?.id]}
        />
      )}
    </div>
  );
}
export default AdminDashboard;

