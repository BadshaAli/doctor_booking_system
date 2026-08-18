import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { PrescriptionModal } from '../components/PrescriptionModal';
import { Calendar, Clock, CheckCircle, XCircle, FileText, DollarSign, Users, Plus, Trash2, RefreshCw } from 'lucide-react';
import { Avatar } from '../components/Avatar';

export const DoctorDashboard = () => {
  const { token, doctorProfile, showToast } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // New slot state
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('09:30');

  const [prescriptionApp, setPrescriptionApp] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const resStats = await fetch(`${API_BASE_URL}/doctor/stats/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      const dataStats = await resStats.json();
      if (resStats.ok) setStats(dataStats);

      const resApps = await fetch(`${API_BASE_URL}/appointments/doctor/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      const dataApps = await resApps.json();
      if (resApps.ok) setAppointments(Array.isArray(dataApps) ? dataApps : []);

      if (doctorProfile?.id) {
        const resSlots = await fetch(`${API_BASE_URL}/doctors/${doctorProfile.id}/slots/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        const dataSlots = await resSlots.json();
        if (resSlots.ok) setSlots(Array.isArray(dataSlots) ? dataSlots : []);
      }
    } catch (err) {
      console.error('Error fetching doctor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, doctorProfile]);

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
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!doctorProfile?.id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/doctors/${doctorProfile.id}/slots/`, {
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
      if (!res.ok) throw new Error(data.error || 'Failed to add slot');

      showToast('Time slot added to schedule!', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!doctorProfile?.id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/doctors/${doctorProfile.id}/slots/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ slot_id: slotId })
      });
      if (res.ok) {
        showToast('Slot removed', 'info');
        fetchDashboardData();
      }
    } catch (err) {
      showToast('Failed to delete slot', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Clinical Practice & Queue Dashboard</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dr. {doctorProfile?.user?.first_name || doctorProfile?.user?.username} ({doctorProfile?.specialty})</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchDashboardData}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Clinical Stats Grid */}
      <div className="grid-stats">
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
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{stats?.completed_consultations || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <CheckCircle size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--secondary)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Revenue</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>৳{Number(stats?.total_earnings || 0).toLocaleString()}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)' }}>
            <DollarSign size={22} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        {/* Patient Appointments Table */}
        <div>
          <div className="clinical-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={18} color="var(--primary)" /> Active Patient Consultations ({appointments.length})
            </h3>

            {loading ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading consultation queue...</p>
            ) : appointments.length > 0 ? (
              <div className="clinical-table-container">
                <table className="clinical-table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Date & Slot</th>
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
                          <td style={{ maxWidth: '200px' }}>
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
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No appointments queued.</p>
            )}
          </div>
        </div>

        {/* Schedule Manager */}
        <div>
          <div className="clinical-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={18} color="var(--primary)" /> Schedule Slot Manager
            </h3>

            <form onSubmit={handleAddSlot} style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <div className="form-group">
                <label className="form-label">Date</label>
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
                  <label className="form-label">Start</label>
                  <input
                    type="time"
                    className="form-input"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End</label>
                  <input
                    type="time"
                    className="form-input"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                <Plus size={14} /> Add Available Slot
              </button>
            </form>

            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Open Slots ({slots.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '260px', overflowY: 'auto' }}>
              {slots.map(slot => (
                <div key={slot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.65rem', background: '#F8FAFC', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                  <div>
                    <strong>{slot.date}</strong> ({slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)})
                    {slot.is_booked && <span style={{ color: 'var(--danger-text)', marginLeft: '6px', fontWeight: 700 }}>(Booked)</span>}
                  </div>
                  {!slot.is_booked && (
                    <button className="close-btn" onClick={() => handleDeleteSlot(slot.id)} title="Delete">
                      <Trash2 size={14} color="var(--danger-text)" />
                    </button>
                  )}
                </div>
              ))}
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
