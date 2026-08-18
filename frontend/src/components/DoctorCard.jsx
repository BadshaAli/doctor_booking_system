import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Award, MapPin, Calendar, CheckCircle2, Building2 } from 'lucide-react';
import { Avatar } from './Avatar';

export const DoctorCard = ({ doctor, onBookClick }) => {
  const { id, user, specialty, qualification, experience_years, consultation_fee, district, hospital, rating, total_reviews } = doctor;
  const firstName = user?.first_name || '';
  const doctorName = user ? `Dr. ${user.first_name || user.username} ${user.last_name || ''}` : 'Dr. Specialist';

  return (
    <div className="clinical-card" style={{
      padding: '1.4rem',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#FFFFFF',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)'
    }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.85rem', alignItems: 'flex-start' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar
            firstName={firstName || doctorName}
            name={doctorName}
            size={72}
            fontSize={26}
          />
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            background: 'var(--success)',
            color: '#FFF',
            borderRadius: '50%',
            padding: '2px',
            display: 'flex',
            border: '2px solid #FFF'
          }} title="BMDC Registered Doctor">
            <CheckCircle2 size={12} />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
            <span className="badge badge-specialty">
              {specialty}
            </span>
            <span style={{
              background: '#EFF6FF',
              color: '#1E40AF',
              fontSize: '0.725rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid #BFDBFE'
            }}>
              <MapPin size={11} style={{ display: 'inline', marginRight: '2px' }} />
              {district}
            </span>
          </div>

          <h3 style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            margin: '0.1rem 0 0.2rem 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {doctorName}
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={qualification}>
            {qualification}
          </p>
        </div>
      </div>

      {/* Experience & Hospital Chamber Info */}
      <div style={{
        background: '#F8FAFC',
        padding: '0.65rem 0.85rem',
        borderRadius: 'var(--radius-sm)',
        margin: '0.25rem 0 1rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        fontSize: '0.825rem',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
          <Award size={15} color="var(--primary)" />
          <span><strong>{experience_years} Years</strong> Experience</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
          <Building2 size={15} color="var(--secondary)" />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hospital}</span>
        </div>
      </div>

      {/* Footer: Rating, BDT Taka Fee & Action Buttons */}
      <div style={{
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B', fontWeight: 700, fontSize: '0.85rem' }}>
            <Star size={14} fill="#F59E0B" /> {rating}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({total_reviews})</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.1rem' }}>
            ৳{Number(consultation_fee).toLocaleString()} <span style={{ fontSize: '0.725rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ visit</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Link to={`/doctor/${id}`} className="btn btn-outline btn-sm">
            Profile
          </Link>
          <button className="btn btn-primary btn-sm" onClick={() => onBookClick(doctor)}>
            <Calendar size={14} /> Book
          </button>
        </div>
      </div>
    </div>
  );
};
export default DoctorCard;
