import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { Avatar } from '../components/Avatar';
import {
  Users, UserCheck, Calendar, ClipboardList, Star, TrendingUp,
  Search, Trash2, CheckCircle, XCircle, Clock, AlertCircle,
  ChevronDown, Activity, MapPin, DollarSign, RefreshCw, Eye, ShieldCheck
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

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div style={{
    background: '#fff', borderRadius: '14px', padding: '1.4rem 1.6rem',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '1.1rem',
    border: '1px solid #f0f0f0', flex: '1 1 180px', minWidth: 0
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: '12px',
      background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      <Icon size={22} color={color} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#111', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '3px', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: color, marginTop: '2px', fontWeight: 600 }}>{sub}</div>}
    </div>
  </div>
);

const SectionHeader = ({ title, count, onRefresh }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111', margin: 0 }}>{title}</h2>
      {count !== undefined && (
        <span style={{ background: '#1a56db', color: '#fff', borderRadius: '20px', padding: '1px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
          {count}
        </span>
      )}
    </div>
    {onRefresh && (
      <button onClick={onRefresh} style={{
        background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px',
        padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
        fontSize: '0.78rem', color: '#555', fontWeight: 500
      }}>
        <RefreshCw size={13} /> Refresh
      </button>
    )}
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
  const [patientSearch, setPatientSearch] = useState('');

  const headers = { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' };

  const fetchStats = useCallback(async () => {
    const res = await fetch(`${API}/admin/stats/`, { headers });
    if (res.ok) setStats(await res.json());
  }, [token]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (apptStatus !== 'All') params.set('status', apptStatus);
    if (apptSearch) params.set('search', apptSearch);
    const res = await fetch(`${API}/admin/appointments/?${params}`, { headers });
    if (res.ok) setAppointments(await res.json());
    setLoading(false);
  }, [token, apptSearch, apptStatus]);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (doctorSearch) params.set('search', doctorSearch);
    const res = await fetch(`${API}/admin/doctors/?${params}`, { headers });
    if (res.ok) setDoctors(await res.json());
    setLoading(false);
  }, [token, doctorSearch]);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (patientSearch) params.set('search', patientSearch);
    const res = await fetch(`${API}/admin/patients/?${params}`, { headers });
    if (res.ok) setPatients(await res.json());
    setLoading(false);
  }, [token, patientSearch]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${API}/admin/reviews/`, { headers });
    if (res.ok) setReviews(await res.json());
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (activeTab === 'appointments') fetchAppointments(); }, [activeTab, fetchAppointments]);
  useEffect(() => { if (activeTab === 'doctors') fetchDoctors(); }, [activeTab, fetchDoctors]);
  useEffect(() => { if (activeTab === 'patients') fetchPatients(); }, [activeTab, fetchPatients]);
  useEffect(() => { if (activeTab === 'reviews') fetchReviews(); }, [activeTab, fetchReviews]);

  const updateApptStatus = async (id, newStatus) => {
    const res = await fetch(`${API}/admin/appointments/${id}/`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      showToast(`Appointment marked as ${newStatus}`, 'success');
      fetchAppointments();
      fetchStats();
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

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    const res = await fetch(`${API}/admin/reviews/${id}/`, { method: 'DELETE', headers });
    if (res.ok) {
      showToast('Review deleted', 'success');
      fetchReviews();
    }
  };

  const tabs = [
    { id: 'overview',      label: 'Overview',      icon: Activity },
    { id: 'appointments',  label: 'Appointments',  icon: Calendar },
    { id: 'doctors',       label: 'Doctors',        icon: UserCheck },
    { id: 'patients',      label: 'Patients',       icon: Users },
    { id: 'reviews',       label: 'Reviews',        icon: Star },
  ];

  return (
    <div style={{ padding: '0 0 2rem' }}>

      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #0D9488 100%)',
        borderRadius: '16px', padding: '1.6rem 2rem', marginBottom: '1.8rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff',
        boxShadow: '0 6px 20px rgba(37, 99, 235, 0.2)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ShieldCheck size={24} color="#FBBF24" />
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>AmarDoctor Admin Portal</h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
            আপনার পছন্দের ডাক্তার, আপনার সময়ে • System Oversight &amp; Issue Resolution
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.8rem', opacity: 0.9 }}>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FCD34D' }}>25 Verified BD Doctors</div>
          <div>amardoctor.com.bd</div>
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

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && stats && (
        <div>
          {/* Stat Cards Row 1 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <StatCard icon={UserCheck} label="Total Doctors" value={stats.total_doctors} color="#1a56db" sub={`${stats.district_counts?.length} districts`} />
            <StatCard icon={Users} label="Total Patients" value={stats.total_patients} color="#7c3aed" />
            <StatCard icon={Calendar} label="Total Appointments" value={stats.total_appointments} color="#0891b2" sub={`${stats.today_appointments} today`} />
            <StatCard icon={DollarSign} label="Est. Revenue" value={`৳${Number(stats.total_revenue || 0).toLocaleString()}`} color="#16a34a" />
          </div>

          {/* Stat Cards Row 2 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.8rem' }}>
            <StatCard icon={Clock}         label="Pending"   value={stats.pending_appointments}   color="#f59e0b" />
            <StatCard icon={CheckCircle}   label="Completed" value={stats.completed_appointments} color="#16a34a" />
            <StatCard icon={XCircle}       label="Cancelled" value={stats.cancelled_appointments} color="#dc2626" />
            <StatCard icon={ClipboardList} label="Prescriptions Issued" value={stats.total_prescriptions} color="#0891b2" />
            <StatCard icon={Star}          label="Reviews"   value={stats.total_reviews}           color="#f59e0b" />
          </div>

          {/* District Breakdown */}
          <div style={{
            background: '#fff', borderRadius: '14px', padding: '1.4rem 1.6rem',
            boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0', marginBottom: '1.5rem'
          }}>
            <SectionHeader title="Doctors by District (10 BD Districts)" onRefresh={fetchStats} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {stats.district_counts?.map(({ district, count }) => (
                <div key={district} style={{
                  background: '#f0f7ff', borderRadius: '10px', padding: '10px 18px',
                  display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #dbeafe'
                }}>
                  <MapPin size={14} color="#1a56db" />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a56db' }}>{district}</span>
                  <span style={{
                    background: '#1a56db', color: '#fff', borderRadius: '20px',
                    padding: '1px 8px', fontSize: '0.72rem', fontWeight: 700
                  }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment Status Breakdown */}
          <div style={{
            background: '#fff', borderRadius: '14px', padding: '1.4rem 1.6rem',
            boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0'
          }}>
            <SectionHeader title="Appointment Status Breakdown" />
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {Object.entries(stats.status_breakdown || {}).map(([s, count]) => {
                const c = STATUS_COLORS[s];
                const total = stats.total_appointments || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={s} style={{
                    flex: '1 1 160px', background: c.bg, border: `1px solid ${c.border}`,
                    borderRadius: '12px', padding: '1rem 1.2rem'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: c.text }}>{count}</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: c.text, marginTop: 2 }}>{s}</div>
                    <div style={{ marginTop: '8px', height: '5px', background: c.border, borderRadius: '3px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: c.text, borderRadius: '3px' }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: c.text, marginTop: 3, fontWeight: 600 }}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── APPOINTMENTS TAB ── */}
      {activeTab === 'appointments' && (
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.4rem 1.6rem', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
          <SectionHeader title="All Appointments" count={appointments.length} onRefresh={fetchAppointments} />

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
                  {['#ID', 'Patient', 'Doctor', 'Date & Time', 'Symptoms', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>Loading appointments...</td></tr>
                )}
                {!loading && appointments.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>No appointments found</td></tr>
                )}
                {appointments.map(appt => {
                  const patName = appt.patient_name || appt.patient?.first_name || appt.patient?.username || 'Patient';
                  const docName = appt.doctor_name || appt.doctor?.user?.first_name || 'Doctor';
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

      {/* ── DOCTORS TAB ── */}
      {activeTab === 'doctors' && (
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.4rem 1.6rem', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
          <SectionHeader title="All Registered BD Doctors" count={doctors.length} onRefresh={fetchDoctors} />

          <div style={{ position: 'relative', marginBottom: '1.2rem', maxWidth: 360 }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
            <input
              placeholder="Search by name, specialty, hospital..."
              value={doctorSearch}
              onChange={e => setDoctorSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.83rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #f0f0f0' }}>
                  {['Doctor Profile', 'Specialty', 'District', 'Hospital / Chamber', 'Fee', 'Rating', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>Loading doctors...</td></tr>}
                {!loading && doctors.length === 0 && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>No doctors found</td></tr>}
                {doctors.map(doc => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <Avatar firstName={doc.user_first_name || 'Dr'} size={34} fontSize={13} />
                        <div>
                          <div style={{ fontWeight: 700, color: '#111' }}>
                            Dr. {doc.user_first_name} {doc.user_last_name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#888' }}>{doc.qualification?.split(',')[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#555', fontWeight: 500 }}>{doc.specialty}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        background: '#f0f7ff', color: '#1a56db', borderRadius: '6px',
                        padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700
                      }}>{doc.district}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#555', fontSize: '0.78rem', maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.hospital}</div>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#16a34a', whiteSpace: 'nowrap' }}>
                      ৳{parseFloat(doc.consultation_fee).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {doc.rating}</span>
                      <span style={{ color: '#aaa', fontSize: '0.72rem', marginLeft: 4 }}>({doc.total_reviews})</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <button onClick={() => deleteDoctor(doc.id, `${doc.user_first_name} ${doc.user_last_name}`)} style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '5px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                        background: '#fee2e2', color: '#dc2626', fontSize: '0.75rem', fontWeight: 600
                      }}>
                        <Trash2 size={12} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PATIENTS TAB ── */}
      {activeTab === 'patients' && (
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.4rem 1.6rem', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
          <SectionHeader title="All Patients" count={patients.length} onRefresh={fetchPatients} />

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
          <SectionHeader title="Patient Feedback & Reviews" count={reviews.length} onRefresh={fetchReviews} />

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
                  <button onClick={() => deleteReview(rv.id)} title="Delete review" style={{
                    flexShrink: 0, padding: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center'
                  }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminDashboard;
