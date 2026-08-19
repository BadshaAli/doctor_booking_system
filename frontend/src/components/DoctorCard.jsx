import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star, Award, MapPin, Calendar, CheckCircle2, Building2,
  UserCheck, ShieldCheck, DollarSign, Percent, FileText, ArrowRight, Eye
} from 'lucide-react';
import { Avatar } from './Avatar';
import { useAuth } from '../context/AuthContext';
import { DoctorAdminModal } from './DoctorAdminModal';

export const DoctorCard = ({ doctor, onBookClick }) => {
  const { user: currentUser, doctorProfile } = useAuth();
  const [showAdminModal, setShowAdminModal] = useState(false);

  const {
    id, user, specialty, qualification, experience_years, consultation_fee, district, hospital,
    rating, total_reviews, prescribed_count = 0, completed_appointments_count = 0,
    gross_revenue = 0, platform_fee_10 = 0, doctor_net_payout = 0
  } = doctor;

  const firstName = user?.first_name || '';
  const doctorName = user ? `Dr. ${user.first_name || user.username} ${user.last_name || ''}` : 'Dr. Specialist';

  const isSelf = currentUser?.id === user?.id || (doctorProfile && doctorProfile.id === id);
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="clinical-card" style={{
      padding: '1.4rem',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#FFFFFF',
      border: isSelf ? '2px solid #3B82F6' : isAdmin ? '1.5px solid #F59E0B' : '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      position: 'relative',
      boxShadow: isAdmin ? '0 2px 10px rgba(245, 158, 11, 0.12)' : undefined
    }}>
      {/* Role Badge Indicator */}
      {isSelf && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '12px',
          background: '#EFF6FF',
          color: '#1D4ED8',
          border: '1px solid #BFDBFE',
          borderRadius: '20px',
          padding: '2px 8px',
          fontSize: '0.68rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <UserCheck size={12} /> Your Chamber
        </div>
      )}

      {isAdmin && !isSelf && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '12px',
          background: '#FEF3C7',
          color: '#B45309',
          border: '1px solid #FDE68A',
          borderRadius: '20px',
          padding: '2px 8px',
          fontSize: '0.68rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <ShieldCheck size={12} /> Admin Track
        </div>
      )}

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
            <CheckCircle2 size={13} strokeWidth={3} />
          </div>
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            margin: '0 0 0.2rem 0',
            color: 'var(--text-main)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {doctorName}
          </h3>
          <p style={{
            color: 'var(--primary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            margin: '0 0 0.35rem 0'
          }}>
            {specialty}
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: 'var(--text-muted)',
            fontSize: '0.78rem'
          }}>
            <MapPin size={13} color="var(--primary)" />
            <span><strong>{district}</strong> District</span>
          </div>
        </div>
      </div>

      {/* Qualifications & Hospital Details */}
      <div style={{
        background: '#F8FAFC',
        borderRadius: 'var(--radius-sm)',
        padding: '0.75rem',
        marginBottom: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        fontSize: '0.825rem',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }} title={qualification}>
          {qualification}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
          <Award size={15} color="var(--primary)" />
          <span><strong>{experience_years} Years</strong> Experience</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
          <Building2 size={15} color="var(--secondary)" />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hospital}</span>
        </div>
      </div>

      {/* ADMIN EXCLUSIVE: Real-Time Individual Doctor Income & 10% Commission Tracking Card */}
      {isAdmin && (
        <div style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
          border: '1px solid #A7F3D0',
          borderRadius: '10px',
          padding: '0.75rem',
          marginBottom: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065F46', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Percent size={12} /> Doctor Income &amp; Site 10% Cut
            </div>
            <span style={{
              background: '#047857',
              color: '#FFF',
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '10px'
            }}>
              Daily Settlement
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.75rem' }}>
            <div style={{ background: '#FFFFFF', padding: '5px 8px', borderRadius: '6px', border: '1px solid #D1FAE5' }}>
              <div style={{ color: '#64748B', fontSize: '0.65rem' }}>Gross Income</div>
              <strong style={{ color: '#111827', fontSize: '0.85rem' }}>৳{Number(gross_revenue).toLocaleString()}</strong>
              <div style={{ fontSize: '0.62rem', color: '#059669' }}>{prescribed_count} Rx Prescribed</div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '5px 8px', borderRadius: '6px', border: '1px solid #A7F3D0' }}>
              <div style={{ color: '#047857', fontSize: '0.65rem', fontWeight: 700 }}>Site 10% Fee Due</div>
              <strong style={{ color: '#047857', fontSize: '0.88rem' }}>+৳{Number(platform_fee_10).toLocaleString()}</strong>
              <div style={{ fontSize: '0.62rem', color: '#64748B' }}>Net 90%: ৳{Number(doctor_net_payout).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

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
          {isSelf ? (
            <Link to="/doctor-dashboard" className="btn btn-primary btn-sm" style={{ background: '#059669' }}>
              My Chamber
            </Link>
          ) : isAdmin ? (
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="btn btn-primary btn-sm"
              style={{ background: '#D97706', borderColor: '#D97706', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Inspect individual doctor information, practice records, and 10% daily commission"
            >
              <Eye size={13} /> Admin View
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => onBookClick(doctor)}>
              <Calendar size={14} /> Book
            </button>
          )}
        </div>
      </div>

      {showAdminModal && (
        <DoctorAdminModal
          doctor={doctor}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </div>
  );
};
export default DoctorCard;

