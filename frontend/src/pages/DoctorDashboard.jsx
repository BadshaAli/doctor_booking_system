import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { PrescriptionModal } from '../components/PrescriptionModal';
import {
  Calendar, Clock, CheckCircle, XCircle, FileText, DollarSign,
  Users, Plus, Trash2, RefreshCw, Sparkles, Building2, MapPin,
  CheckCircle2, AlertCircle, Percent
} from 'lucide-react';
import { Avatar } from '../components/Avatar';

export const DoctorDashboard = () => {
  const { token, user, doctorProfile, showToast } = useAuth();
  const [currentProfile, setCurrentProfile] = useState(doctorProfile);
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingSlot, setAddingSlot] = useState(false);

  // New slot form state
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('09:30');

  const [prescriptionApp, setPrescriptionApp] = useState(null);

  // Fetch full profile if doctorProfile in context is missing or outdated
  const fetchCurrentDoctorProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.doctor_profile) {
          setCurrentProfile(data.doctor_profile);
          return data.doctor_profile;
        }
      }
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
    }
    return null;
  }, [token]);

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Fetch Doctor Stats
      const resStats = await fetch(`${API_BASE_URL}/doctor/stats/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (resStats.ok) {
        const dataStats = await resStats.json();
        setStats(dataStats);
      }

      // 2. Fetch Doctor Appointments
      const resApps = await fetch(`${API_BASE_URL}/appointments/doctor/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (resApps.ok) {
        const dataApps = await resApps.json();
        setAppointments(Array.isArray(dataApps) ? dataApps : []);
      }

      // 3. Fetch Doctor Chamber Slots
      let profile = currentProfile || doctorProfile;
      if (!profile) {
        profile = await fetchCurrentDoctorProfile();
      }

      const resSlots = await fetch(`${API_BASE_URL}/doctor/slots/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (resSlots.ok) {
        const dataSlots = await resSlots.json();
        setSlots(Array.isArray(dataSlots) ? dataSlots : []);
      } else if (profile?.id) {
        // Fallback endpoint
        const resSlotsFallback = await fetch(`${API_BASE_URL}/doctors/${profile.id}/slots/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        if (resSlotsFallback.ok) {
          const dataFallback = await resSlotsFallback.json();
          setSlots(Array.isArray(dataFallback) ? dataFallback : []);
        }
      }
    } catch (err) {
      console.error('Error loading doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [token, currentProfile, doctorProfile, fetchCurrentDoctorProfile]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${appId}/status/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Appointment status updated to ${newStatus}`, 'success');
        fetchDashboardData();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Failed to update appointment', 'error');
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setAddingSlot(true);
    try {
      const res = await fetch(`${API_BASE_URL}/doctor/slots/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          date: newDate,
          start_time: newStartTime,
          end_time: newEndTime
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add chamber slot');

      showToast(`Chamber slot added for ${newDate} (${newStartTime} - ${newEndTime})`, 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAddingSlot(false);
    }
  };

  const handleQuickAddBatch = async (period) => {
    setAddingSlot(true);
    try {
      const slotsToAdd = period === 'morning' ? [
        { start_time: '09:00', end_time: '09:30' },
        { start_time: '09:30', end_time: '10:00' },
        { start_time: '10:00', end_time: '10:30' },
        { start_time: '10:30', end_time: '11:00' },
      ] : [
        { start_time: '17:00', end_time: '17:30' },
        { start_time: '17:30', end_time: '18:00' },
        { start_time: '18:00', end_time: '18:30' },
        { start_time: '18:30', end_time: '19:00' },
      ];

      for (const s of slotsToAdd) {
        await fetch(`${API_BASE_URL}/doctor/slots/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({
            date: newDate,
            start_time: s.start_time,
            end_time: s.end_time
          })
        });
      }

      showToast(`Added 4 ${period} chamber slots for ${newDate}!`, 'success');
      fetchDashboardData();
    } catch (err) {
      showToast('Error generating bulk slots', 'error');
    } finally {
      setAddingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/doctor/slots/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ slot_id: slotId })
      });
      if (res.ok) {
        showToast('Chamber slot removed', 'info');
        fetchDashboardData();
      } else {
        showToast('Failed to delete slot', 'error');
      }
    } catch (err) {
      showToast('Failed to delete slot', 'error');
    }
  };

  const profile = currentProfile || doctorProfile;
  const docName = `Dr. ${user?.first_name || user?.username} ${user?.last_name || ''}`.trim();
  const fee = parseFloat(profile?.consultation_fee || 0);
  const grossEarnings = Number(stats?.total_earnings || 0);
  const platformCut10 = grossEarnings * 0.10;
  const doctorNet90 = grossEarnings * 0.90;

  return (
    <div style={{ padding: '0 0 2rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 55%, #059669 100%)',
        borderRadius: '16px', padding: '1.6rem 2rem', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff',
        boxShadow: '0 6px 20px rgba(37, 99, 235, 0.2)', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Avatar firstName={user?.first_name || user?.username} name={docName} size={64} fontSize={26} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>{docName}</h1>
              <span style={{
                background: 'rgba(255, 255, 255, 0.2)', color: '#FFF',
                borderRadius: '20px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700
              }}>
                BMDC Specialist
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
              {profile?.specialty} Specialist • <Building2 size={13} style={{ display: 'inline' }} /> {profile?.hospital} ({profile?.district} District)
            </p>
          </div>
        </div>

        <button
          className="btn btn-sm"
          onClick={fetchDashboardData}
          style={{
            background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#FFF', display: 'flex', alignItems: 'center', gap: '4px'
          }}
        >
          <RefreshCw size={14} /> Refresh Practice Data
        </button>
      </div>

      {/* Clinical Stats Grid */}
      <div className="grid-stats" style={{ marginBottom: '1.25rem' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Today's Appts</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{stats?.today_appointments || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Calendar size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Approvals</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{stats?.pending_requests || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed Visits</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{stats?.completed_consultations || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <CheckCircle size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #2563EB' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Billings</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>৳{grossEarnings.toLocaleString()}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)' }}>
            <DollarSign size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #059669', background: '#F0FDF4' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>10% Payable to Site</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#047857' }}>
              +৳{platformCut10.toLocaleString()}
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#DCFCE7', color: '#059669' }}>
            <Percent size={22} />
          </div>
        </div>
      </div>

      {/* Transparent Commission Formula Banner */}
      <div style={{
        background: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: '10px',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        fontSize: '0.82rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E40AF', fontWeight: 700 }}>
          <span>💡 10% Platform Fee Calculation:</span>
          <span style={{ background: '#FFF', padding: '2px 8px', borderRadius: '5px', border: '1px solid #DBEAFE' }}>
            {stats?.completed_consultations || 0} Consultations × ৳{fee.toLocaleString()} Fee = ৳{grossEarnings.toLocaleString()} Gross
          </span>
          <span>× 10% =</span>
          <strong style={{ color: '#059669', fontSize: '0.9rem' }}>+৳{platformCut10.toLocaleString()} Payable to Site (Daily Basis)</strong>
        </div>
        <div style={{ color: '#4338CA', fontWeight: 700 }}>
          Your Net Profit (90%): ৳{doctorNet90.toLocaleString()}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 370px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Patient Appointments Table */}
        <div>
          <div className="clinical-card" style={{ padding: '1.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={18} color="var(--primary)" /> Active Patient Consultations ({appointments.length})
              </h3>
            </div>

            {loading ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading consultation queue...</p>
            ) : appointments.length > 0 ? (
              <div className="clinical-table-container">
                <table className="clinical-table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Date &amp; Slot</th>
                      <th>Symptoms</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((app) => {
                      const patientFirstName = app.patient?.first_name || app.patient?.username || 'Patient';
                      const patientName = `${patientFirstName} ${app.patient?.last_name || ''}`;
                      return (
                        <tr key={app.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <Avatar firstName={patientFirstName} name={patientName} size={34} fontSize={13} />
                              <div>
                                <strong style={{ fontSize: '0.875rem' }}>{patientName}</strong>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone: {app.patient?.phone || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{app.date}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.time_slot}</div>
                          </td>
                          <td style={{ maxWidth: '180px' }}>
                            <div style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.symptoms}>
                              {app.symptoms}
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              {app.status === 'PENDING' && (
                                <>
                                  <button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}>
                                    <CheckCircle size={14} /> Confirm
                                  </button>
                                  <button className="btn btn-danger btn-sm" onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}>
                                    <XCircle size={14} /> Reject
                                  </button>
                                </>
                              )}

                              {app.status === 'CONFIRMED' && (
                                <button className="btn btn-primary btn-sm" onClick={() => setPrescriptionApp(app)}>
                                  <FileText size={14} /> Prescribe
                                </button>
                              )}

                              {app.status === 'COMPLETED' && (
                                <button className="btn btn-outline btn-sm" onClick={() => setPrescriptionApp(app)}>
                                  <FileText size={14} /> View Rx
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No appointments queued. Chamber slots are open for patients to book!
              </div>
            )}
          </div>
        </div>

        {/* Chamber Schedule Manager */}
        <div>
          <div className="clinical-card" style={{ padding: '1.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={18} color="var(--primary)" /> Doctor Chamber Slots
              </h3>
              <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                {slots.length} Slots
              </span>
            </div>

            {/* Quick Bulk Slot Generator */}
            <div style={{ marginBottom: '1rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} color="#D97706" /> Quick Generate for Selected Date:
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickAddBatch('morning')}
                  disabled={addingSlot}
                  style={{
                    flex: 1, padding: '5px', fontSize: '0.72rem', fontWeight: 700,
                    borderRadius: '6px', border: '1px solid #BFDBFE', background: '#EFF6FF',
                    color: '#1D4ED8', cursor: 'pointer'
                  }}
                >
                  + Morning (9-11 AM)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddBatch('evening')}
                  disabled={addingSlot}
                  style={{
                    flex: 1, padding: '5px', fontSize: '0.72rem', fontWeight: 700,
                    borderRadius: '6px', border: '1px solid #BBF7D0', background: '#F0FDF4',
                    color: '#047857', cursor: 'pointer'
                  }}
                >
                  + Evening (5-7 PM)
                </button>
              </div>
            </div>

            {/* Single Custom Slot Form */}
            <form onSubmit={handleAddSlot} style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <div className="form-group">
                <label className="form-label">Chamber Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={newDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-sm" disabled={addingSlot} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Plus size={14} /> {addingSlot ? 'Adding Slot...' : 'Add Chamber Slot'}
              </button>
            </form>

            {/* Slot List */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Open Chamber Slots ({slots.length})
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '280px', overflowY: 'auto' }}>
              {slots.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', background: '#F8FAFC', borderRadius: '6px' }}>
                  No slots created yet. Use the form above to add available chamber hours.
                </div>
              ) : (
                slots.map(slot => (
                  <div key={slot.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem 0.75rem', background: slot.is_booked ? '#FEF2F2' : '#F8FAFC',
                    borderRadius: '6px', border: `1px solid ${slot.is_booked ? '#FECACA' : 'var(--border-color)'}`, fontSize: '0.8rem'
                  }}>
                    <div>
                      <strong>{slot.date}</strong> ({slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)})
                      {slot.is_booked ? (
                        <span style={{ color: '#DC2626', marginLeft: '6px', fontWeight: 700, fontSize: '0.72rem' }}>• Booked</span>
                      ) : (
                        <span style={{ color: '#16A34A', marginLeft: '6px', fontWeight: 700, fontSize: '0.72rem' }}>• Open</span>
                      )}
                    </div>
                    {!slot.is_booked && (
                      <button
                        className="close-btn"
                        onClick={() => handleDeleteSlot(slot.id)}
                        title="Delete slot"
                        style={{ padding: '2px', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} color="#EF4444" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Issue Modal */}
      {prescriptionApp && (
        <PrescriptionModal
          appointment={prescriptionApp}
          onClose={() => setPrescriptionApp(null)}
          onSuccess={() => fetchDashboardData()}
        />
      )}
    </div>
  );
};
export default DoctorDashboard;
