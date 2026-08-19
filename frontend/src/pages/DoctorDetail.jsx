import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { BookingModal } from '../components/BookingModal';
import {
  Star, Award, MapPin, Calendar, Clock, ArrowLeft, MessageSquare,
  ShieldCheck, CheckCircle2, UserCheck, Percent, DollarSign, FileText
} from 'lucide-react';
import { Avatar } from '../components/Avatar';

export const DoctorDetail = () => {
  const { id } = useParams();
  const { user: currentUser, doctorProfile } = useAuth();
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const fetchDoctorDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/doctors/${id}/`);
      const data = await res.json();
      if (res.ok) {
        setDoctorData(data);
      }
    } catch (err) {
      console.error('Error fetching doctor details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDetail();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p className="text-muted">Loading BMDC doctor profile & chamber details...</p>
      </div>
    );
  }

  if (!doctorData || !doctorData.doctor) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Doctor Not Found</h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>The requested doctor profile is unavailable.</p>
        <Link to="/" className="btn btn-primary"><ArrowLeft size={16} /> Return to Doctors Directory</Link>
      </div>
    );
  }

  const { doctor, available_slots = [], reviews = [] } = doctorData;
  const firstName = doctor.user?.first_name || doctor.user?.username || '';
  const doctorName = `Dr. ${doctor.user?.first_name || doctor.user?.username} ${doctor.user?.last_name || ''}`;
  const isSelf = currentUser?.id === doctor.user?.id || (doctorProfile && doctorProfile.id === doctor.id);
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto 3rem' }}>
      <Link to="/" className="btn btn-outline btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <ArrowLeft size={16} /> Back to Directory
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Main Details Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Card */}
          <div className="clinical-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Avatar
                  firstName={firstName}
                  name={doctorName}
                  size={100}
                  fontSize={38}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  background: 'var(--success)',
                  color: '#FFF',
                  borderRadius: '50%',
                  padding: '4px',
                  display: 'flex',
                  border: '3px solid #FFF'
                }} title="BMDC Registered Doctor">
                  <CheckCircle2 size={16} strokeWidth={3} />
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                  <span className="badge badge-specialty" style={{ fontSize: '0.825rem' }}>{doctor.specialty}</span>
                  <span style={{
                    background: '#EFF6FF',
                    color: '#1E40AF',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    border: '1px solid #BFDBFE'
                  }}>
                    <MapPin size={13} style={{ display: 'inline', marginRight: '3px' }} />
                    {doctor.district} District
                  </span>
                </div>

                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: 'var(--text-main)' }}>
                  {doctorName}
                </h1>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0', lineHeight: 1.4 }}>
                  {doctor.qualification}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#F59E0B', fontWeight: 700 }}>
                    <Star size={16} fill="#F59E0B" /> {doctor.rating}
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({doctor.total_reviews} verified reviews)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    <Award size={16} color="var(--primary)" /> {doctor.experience_years} Years Experience
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chamber & Hospital Information */}
          <div className="clinical-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} color="var(--primary)" /> Chamber &amp; Hospital Affiliation
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, margin: '0 0 0.35rem 0' }}>
              {doctor.hospital}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              District: <strong>{doctor.district}</strong> • Bangladesh Medical &amp; Dental Council Verified Practitioner
            </p>
          </div>

          {/* About Doctor */}
          <div className="clinical-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>About Doctor</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              {doctor.bio || `Dr. ${doctor.user?.first_name || doctor.user?.username} is a renowned ${doctor.specialty} specialist practicing in ${doctor.district} with over ${doctor.experience_years} years of clinical excellence.`}
            </p>
          </div>

          {/* Patient Reviews */}
          <div className="clinical-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MessageSquare size={18} color="var(--secondary)" /> Patient Reviews ({reviews.length})
            </h3>

            {reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {reviews.map(rev => (
                  <div key={rev.id} style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.875rem' }}>{rev.patient?.first_name || rev.patient?.username || 'Patient'}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#F59E0B', fontSize: '0.85rem', fontWeight: 700 }}>
                        <Star size={14} fill="#F59E0B" /> {rev.rating}/5
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>No patient reviews posted yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar Booking & Admin Financial Summary */}
        <div>
          <div className="clinical-card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
            {isSelf ? (
              <div>
                <div style={{
                  background: '#EFF6FF',
                  color: '#1E40AF',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700
                }}>
                  <UserCheck size={16} /> This is your doctor profile
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Consultation Fee</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.25rem' }}>
                  ৳{Number(doctor.consultation_fee).toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ visit</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  You cannot book an appointment with yourself. You can manage your slots, review appointments, and issue prescriptions in your chamber portal.
                </p>
                <Link to="/doctor-dashboard" className="btn btn-primary btn-lg" style={{ width: '100%', textAlign: 'center', background: '#059669' }}>
                  Go to Doctor Chamber Portal
                </Link>
              </div>
            ) : isAdmin ? (
              /* SYSTEM ADMIN EXCLUSIVE VIEW: FINANCIAL & PRACTICE TRACKER */
              <div>
                <div style={{
                  background: '#FEF3C7',
                  color: '#92400E',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  border: '1px solid #FDE68A'
                }}>
                  <ShieldCheck size={18} color="#D97706" /> System Admin Inspection
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Consultation Fee
                  </span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ৳{Number(doctor.consultation_fee).toLocaleString()}
                  </div>
                </div>

                {/* Individual Income & 10% Cut Box */}
                <div style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#065F46', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Percent size={14} /> Doctor Income &amp; 10% Platform Fee
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #DCFCE7', paddingBottom: '4px' }}>
                      <span style={{ color: '#64748B' }}>Prescriptions Issued:</span>
                      <strong style={{ color: '#047857' }}>{doctor.prescribed_count || 0}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #DCFCE7', paddingBottom: '4px' }}>
                      <span style={{ color: '#64748B' }}>Gross Doctor Billings:</span>
                      <strong style={{ color: '#111827' }}>৳{Number(doctor.gross_revenue || 0).toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #DCFCE7', paddingBottom: '4px' }}>
                      <span style={{ color: '#047857', fontWeight: 700 }}>AmarDoctor 10% Cut:</span>
                      <strong style={{ color: '#047857', fontSize: '0.9rem' }}>+৳{Number(doctor.platform_fee_10 || 0).toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Doctor Net Payout (90%):</span>
                      <strong style={{ color: '#4338CA' }}>৳{Number(doctor.doctor_net_payout || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                  ℹ️ <em>System Administrators cannot book appointments for themselves. You can track this doctor's daily income and mark daily commission as settled in the Admin Dashboard.</em>
                </p>

                <Link to="/admin-dashboard" className="btn btn-primary btn-lg" style={{ width: '100%', textAlign: 'center', background: '#D97706', borderColor: '#D97706' }}>
                  Open Admin Financial Dashboard
                </Link>
              </div>
            ) : (
              /* REGULAR PATIENT VIEW */
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Consultation Fee</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.25rem' }}>
                  ৳{Number(doctor.consultation_fee).toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ visit</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="var(--success)" /> Verified BMDC Specialist
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color="var(--primary)" /> Chamber: {doctor.district} District
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} color="var(--secondary)" /> Instant Serial Booking
                  </div>
                </div>

                <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => setShowBookingModal(true)}>
                  Book Appointment (৳{Number(doctor.consultation_fee).toLocaleString()})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          doctor={doctor}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            fetchDoctorDetail();
          }}
        />
      )}
    </div>
  );
};
export default DoctorDetail;
