import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { PrescriptionModal } from '../components/PrescriptionModal';
import { ReviewModal } from '../components/ReviewModal';
import { Calendar, Clock, FileText, Star, RefreshCw, AlertCircle, XCircle } from 'lucide-react';
import { Avatar } from '../components/Avatar';

export const PatientDashboard = () => {
  const { token, user, showToast } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  
  const [prescriptionApp, setPrescriptionApp] = useState(null);
  const [reviewDoctor, setReviewDoctor] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/patient/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const handleCancelAppointment = async (appId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${appId}/status/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      if (res.ok) {
        showToast('Appointment cancelled', 'info');
        fetchAppointments();
      }
    } catch (err) {
      showToast('Failed to cancel appointment', 'error');
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (activeTab === 'ALL') return true;
    return app.status === activeTab;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Patient Health Record & Bookings</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Track past consultations, upcoming slots, and digital prescriptions.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchAppointments}>
          <RefreshCw size={14} /> Refresh Records
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="clinical-card" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.4rem' }}>
        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab(tab)}
            style={{ borderRadius: '4px', fontSize: '0.775rem' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* EHR Appointments Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading patient health records...
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="clinical-table-container">
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Appt ID</th>
                <th>Specialist Doctor</th>
                <th>Schedule Slot</th>
                <th>Symptoms / Notes</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((app) => {
                const docName = `Dr. ${app.doctor?.user?.first_name || app.doctor?.user?.username} ${app.doctor?.user?.last_name || ''}`;
                return (
                  <tr key={app.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>#{app.id}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Avatar
                          firstName={app.doctor?.user?.first_name || docName}
                          name={docName}
                          size={38}
                          fontSize={14}
                        />
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>{docName}</strong>
                          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{app.doctor?.specialty}</div>
                        </div>
                      </div>

                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{app.date}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.time_slot}</div>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <div style={{ fontSize: '0.825rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.symptoms}>
                        {app.symptoms}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {app.prescription && (
                          <button className="btn btn-secondary btn-sm" onClick={() => setPrescriptionApp(app)}>
                            <FileText size={14} /> View Rx
                          </button>
                        )}

                        {app.status === 'COMPLETED' && (
                          <button className="btn btn-outline btn-sm" onClick={() => setReviewDoctor({ id: app.doctor?.id, name: docName })}>
                            <Star size={14} color="#F59E0B" /> Rate
                          </button>
                        )}

                        {(app.status === 'PENDING' || app.status === 'CONFIRMED') && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancelAppointment(app.id)}>
                            <XCircle size={14} /> Cancel
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
        <div className="clinical-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <AlertCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
          <p>No appointments recorded under status: <strong>{activeTab}</strong></p>
        </div>
      )}

      {/* Prescription View Modal */}
      {prescriptionApp && (
        <PrescriptionModal
          appointment={prescriptionApp}
          onClose={() => setPrescriptionApp(null)}
          onSuccess={() => fetchAppointments()}
        />
      )}

      {/* Review Modal */}
      {reviewDoctor && (
        <ReviewModal
          doctorId={reviewDoctor.id}
          doctorName={reviewDoctor.name}
          onClose={() => setReviewDoctor(null)}
          onSuccess={() => fetchAppointments()}
        />
      )}
    </div>
  );
};
