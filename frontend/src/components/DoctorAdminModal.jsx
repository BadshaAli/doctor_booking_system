import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { Avatar } from './Avatar';
import {
  X, ShieldCheck, User, Mail, Phone, MapPin, Building2,
  Award, Star, DollarSign, Percent, FileText, Calendar,
  Clock, CheckCircle, AlertCircle, RefreshCw, Calculator, ArrowRight
} from 'lucide-react';

export const DoctorAdminModal = ({ doctor, onClose, onSettlementToggle, isSettled = false }) => {
  const { token, showToast } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);

  const {
    id, user, specialty, qualification, experience_years, consultation_fee,
    district, hospital, bio, rating, total_reviews, prescribed_count = 0,
    completed_appointments_count = 0, total_appointments_count = 0,
    gross_revenue = 0, platform_fee_10 = 0, doctor_net_payout = 0
  } = doctor;

  const doctorName = `Dr. ${user?.first_name || user?.username} ${user?.last_name || ''}`.trim();
  const firstName = user?.first_name || user?.username || 'Dr';
  const feeNum = parseFloat(consultation_fee || 0);

  // Fetch recent appointments for this specific doctor
  useEffect(() => {
    const fetchDoctorAppts = async () => {
      setLoadingAppts(true);
      try {
        const res = await fetch(`${API_BASE_URL}/admin/appointments/?search=${encodeURIComponent(user?.username || '')}`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          // Filter to only match this doctor
          setAppointments(Array.isArray(data) ? data.filter(a => a.doctor?.id === id || a.doctor_name?.includes(user?.first_name)) : []);
        }
      } catch (err) {
        console.error('Error fetching doctor appointments:', err);
      } finally {
        setLoadingAppts(false);
      }
    };
    if (token) fetchDoctorAppts();
  }, [id, user, token]);

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '820px', width: '94%', maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={26} color="#D97706" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1E293B' }}>
                System Admin • Doctor Profile &amp; Financial Inspector
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                Individual credentials, practice records, and 10% daily settlement ledger
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
            <X size={22} />
          </button>
        </div>

        {/* Doctor Identity & Profile Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
          borderRadius: '12px', padding: '1.4rem', color: '#FFF',
          display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)', flexWrap: 'wrap'
        }}>
          <Avatar firstName={firstName} name={doctorName} size={70} fontSize={28} />
          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>{doctorName}</h3>
              <span style={{
                background: 'rgba(255,255,255,0.2)', color: '#FFF',
                borderRadius: '20px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700
              }}>
                BMDC Verified
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '2px' }}>{specialty} Specialist</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '1px' }}>{qualification}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', marginTop: '6px', flexWrap: 'wrap' }}>
              <span><MapPin size={13} style={{ display: 'inline', marginRight: '2px' }} /> {district} District</span>
              <span><Award size={13} style={{ display: 'inline', marginRight: '2px' }} /> {experience_years} Years Experience</span>
              <span><Star size={13} fill="#FCD34D" color="#FCD34D" style={{ display: 'inline', marginRight: '2px' }} /> {rating} ({total_reviews} reviews)</span>
            </div>
          </div>
        </div>

        {/* Individual Information Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
          {/* Account & Contact Info */}
          <div style={{ background: '#F8FAFC', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={14} color="#2563EB" /> Account &amp; Contact Details
            </div>
            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div>Username: <strong style={{ fontFamily: 'monospace', color: '#1E40AF' }}>{user?.username}</strong></div>
              <div>Email: <strong style={{ color: '#1E293B' }}>{user?.email || 'doctor@amardoctor.com.bd'}</strong></div>
              <div>Phone: <strong style={{ color: '#1E293B' }}>{user?.phone || '+880 1711-000000'}</strong></div>
              <div>Role: <strong style={{ color: '#059669' }}>DOCTOR</strong></div>
            </div>
          </div>

          {/* Chamber & Hospital Address */}
          <div style={{ background: '#F8FAFC', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Building2 size={14} color="#059669" /> Chamber &amp; Hospital Location
            </div>
            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div>Hospital: <strong style={{ color: '#1E293B' }}>{hospital}</strong></div>
              <div>District: <strong style={{ color: '#1E293B' }}>{district}</strong></div>
              <div>Consultation Fee: <strong style={{ color: '#2563EB', fontSize: '0.95rem' }}>৳{feeNum.toLocaleString()}</strong> / visit</div>
              <div>Status: <strong style={{ color: '#16A34A' }}>Active Practitioner</strong></div>
            </div>
          </div>
        </div>

        {/* ── PROMINENT: HOW MUCH DOCTOR HAS TO PAY TO SITE (TOTAL CONSULTATIONS × 10%) ── */}
        <div style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
          color: '#FFF',
          borderRadius: '12px',
          padding: '1.4rem',
          marginBottom: '1.25rem',
          boxShadow: '0 4px 16px rgba(6, 95, 70, 0.25)',
          border: '1px solid #059669'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={20} color="#34D399" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#FFF' }}>
                How Much This Doctor Must Pay To The Site (10% Fee)
              </h3>
            </div>
            {onSettlementToggle && (
              <button
                onClick={() => onSettlementToggle(id)}
                style={{
                  padding: '5px 12px', borderRadius: '8px', border: '1px solid',
                  borderColor: isSettled ? '#86EFAC' : '#FCD34D',
                  background: isSettled ? '#DCFCE7' : '#FEF3C7',
                  color: isSettled ? '#15803D' : '#92400E',
                  fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer'
                }}
              >
                {isSettled ? '✓ 10% Fee Paid (Daily Settled)' : '⚡ Daily Fee Due: Click to Mark Paid'}
              </button>
            )}
          </div>

          {/* Mathematical Formula Breakdown Strip */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            padding: '0.9rem 1.1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', fontSize: '0.88rem' }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                {completed_appointments_count} Completed Visits
              </span>
              <span>×</span>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                ৳{feeNum.toLocaleString()} Fee
              </span>
              <span>=</span>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                ৳{Number(gross_revenue).toLocaleString()} Gross
              </span>
              <span>×</span>
              <span style={{ background: '#34D399', color: '#064E3B', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                10% Site Cut
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#A7F3D0', fontWeight: 600 }}>Total Doctor Must Pay Site:</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#34D399', lineHeight: 1.1 }}>
                ৳{Number(platform_fee_10).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Summary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div style={{ fontSize: '0.68rem', color: '#D1FAE5' }}>Total Consultations Done</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>{completed_appointments_count}</div>
              <div style={{ fontSize: '0.65rem', color: '#A7F3D0' }}>{prescribed_count} Prescriptions</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div style={{ fontSize: '0.68rem', color: '#D1FAE5' }}>Gross Doctor Billings</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>৳{Number(gross_revenue).toLocaleString()}</div>
              <div style={{ fontSize: '0.65rem', color: '#A7F3D0' }}>Total patient payments</div>
            </div>

            <div style={{ background: 'rgba(52, 211, 153, 0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid #34D399' }}>
              <div style={{ fontSize: '0.68rem', color: '#A7F3D0', fontWeight: 800 }}>⚡ 10% Payable to Site</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#34D399' }}>+৳{Number(platform_fee_10).toLocaleString()}</div>
              <div style={{ fontSize: '0.65rem', color: '#D1FAE5' }}>AmarDoctor Site Income</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div style={{ fontSize: '0.68rem', color: '#D1FAE5' }}>Doctor Net Keep (90%)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FCD34D' }}>৳{Number(doctor_net_payout).toLocaleString()}</div>
              <div style={{ fontSize: '0.65rem', color: '#D1FAE5' }}>Doctor's net profit</div>
            </div>
          </div>
        </div>

        {/* Doctor's Consultation History Table */}
        <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={15} color="#2563EB" /> Recent Patient Consultations for {doctorName} ({appointments.length})
          </div>

          {loadingAppts ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>Loading consultation records...</div>
          ) : appointments.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>No consultation records yet for this doctor chamber.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>Patient</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>Date &amp; Time</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>Symptoms / Rx</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right' }}>Fee (10% Site Cut)</th>
                    <th style={{ padding: '6px 10px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 8).map(appt => (
                    <tr key={appt.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '7px 10px', fontWeight: 600 }}>{appt.patient_name || appt.patient?.first_name || 'Patient'}</td>
                      <td style={{ padding: '7px 10px', color: '#64748B' }}>{appt.date} • {appt.time_slot}</td>
                      <td style={{ padding: '7px 10px', color: '#475569', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {appt.symptoms} {appt.prescription && <span style={{ color: '#059669', fontWeight: 700 }}>(Rx)</span>}
                      </td>
                      <td style={{ padding: '7px 10px', textAlign: 'right' }}>
                        <strong>৳{feeNum.toLocaleString()}</strong>
                        <span style={{ color: '#047857', display: 'block', fontSize: '0.65rem', fontWeight: 700 }}>+৳{(feeNum * 0.10).toLocaleString()} (10% site fee)</span>
                      </td>
                      <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                        <span style={{
                          background: appt.status === 'COMPLETED' ? '#DCFCE7' : appt.status === 'CONFIRMED' ? '#E0F2FE' : '#FEF3C7',
                          color: appt.status === 'COMPLETED' ? '#16A34A' : appt.status === 'CONFIRMED' ? '#0284C7' : '#D97706',
                          borderRadius: '4px', padding: '1px 6px', fontSize: '0.68rem', fontWeight: 700
                        }}>
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
export default DoctorAdminModal;
