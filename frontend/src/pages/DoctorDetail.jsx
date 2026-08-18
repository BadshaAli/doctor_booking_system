import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../context/AuthContext';
import { BookingModal } from '../components/BookingModal';
import { Star, Award, MapPin, Calendar, Clock, ArrowLeft, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Avatar } from '../components/Avatar';

export const DoctorDetail = () => {
  const { id } = useParams();
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
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p className="text-muted">Loading doctor profile details...</p>
      </div>
    );
  }

  if (!doctorData || !doctorData.doctor) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Doctor not found</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Doctor Directory</Link>
      </div>
    );
  }

  const { doctor, available_slots, reviews } = doctorData;
  const doctorName = `Dr. ${doctor.user?.first_name || doctor.user?.username} ${doctor.user?.last_name || ''}`;

  return (
    <div>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} /> Back to Doctor Directory
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.75rem' }}>
        {/* Main Content */}
        <div>
          {/* Header Profile Card */}
          <div className="clinical-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <Avatar
                firstName={doctor.user?.first_name || doctorName}
                name={doctorName}
                size={110}
                fontSize={42}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span className="badge badge-specialty">{doctor.specialty}</span>
                  <span style={{ background: '#EFF6FF', color: '#1E40AF', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid #BFDBFE' }}>
                    <MapPin size={12} style={{ display: 'inline', marginRight: '3px' }} />
                    {doctor.district} District
                  </span>
                </div>

                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{doctorName}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{doctor.qualification}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Award size={16} color="var(--primary)" />
                    <span><strong>{doctor.experience_years} Years</strong> Exp.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Star size={16} fill="#F59E0B" color="#F59E0B" />
                    <span><strong>{doctor.rating}</strong> ({doctor.total_reviews} reviews)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={16} color="var(--secondary)" />
                    <span>{doctor.hospital}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Bio */}
          <div className="clinical-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>About Dr. {doctor.user?.last_name || doctor.user?.username}</h3>
            <p style={{ color: 'var(--text-main)', lineHeight: 1.6, fontSize: '0.925rem' }}>
              {doctor.bio || 'Renowned Bangladeshi specialist committed to providing high quality medical care.'}
            </p>
          </div>

          {/* Available Chamber Slots */}
          <div className="clinical-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={18} color="var(--primary)" /> Available Chamber Time Slots ({available_slots.length})
            </h3>

            {available_slots.length > 0 ? (
              <div className="slots-grid">
                {available_slots.map(slot => (
                  <div key={slot.id} className="slot-pill" style={{ background: '#EFF6FF', color: 'var(--primary)', borderColor: '#BFDBFE' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{slot.date}</div>
                    <div>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>No open chamber slots listed for today.</p>
            )}
          </div>

          {/* Reviews */}
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

        {/* Sidebar Booking Summary */}
        <div>
          <div className="clinical-card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
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
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          doctor={doctor}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => fetchDoctorDetail()}
        />
      )}
    </div>
  );
};
