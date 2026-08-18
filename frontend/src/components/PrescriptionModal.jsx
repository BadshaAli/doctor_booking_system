import React, { useState } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { X, FileText, Pill, Calendar, AlertCircle } from 'lucide-react';

export const PrescriptionModal = ({ appointment, onClose, onSuccess }) => {
  const { token, role, showToast } = useAuth();
  const existingPrescription = appointment?.prescription;

  const [diagnosis, setDiagnosis] = useState(existingPrescription?.diagnosis || '');
  const [medications, setMedications] = useState(existingPrescription?.medications || '');
  const [advice, setAdvice] = useState(existingPrescription?.advice || '');
  const [followUpDate, setFollowUpDate] = useState(existingPrescription?.follow_up_date || '');
  const [loading, setLoading] = useState(false);

  const isDoctor = role === 'DOCTOR';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim() || !medications.trim()) {
      showToast('Diagnosis and medications are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/prescriptions/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          appointment_id: appointment.id,
          diagnosis,
          medications,
          advice,
          follow_up_date: followUpDate || null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save prescription');

      showToast('Prescription saved & consultation marked completed!', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2 className="h3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="var(--primary)" />
              {isDoctor ? 'Issue Digital Prescription' : 'Digital Prescription'}
            </h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              Appointment #{appointment?.id} - {appointment?.date} ({appointment?.time_slot})
            </p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {isDoctor ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Diagnosis / Clinical Findings *</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. Mild Hypertension, Upper Respiratory Infection..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Pill size={15} style={{ display: 'inline', marginRight: '6px' }} /> Medications & Dosage *</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="e.g. 1. Amoxicillin 500mg - 1 capsule twice daily after meals (7 days)&#10;2. Paracetamol 500mg - 1 tablet as needed for fever."
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Special Advice & Lifestyle Instructions</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. Drink plenty of fluids, rest, avoid heavy exercise..."
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Calendar size={15} style={{ display: 'inline', marginRight: '6px' }} /> Recommended Follow-up Date</label>
              <input
                type="date"
                className="form-input"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save & Issue Prescription'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {existingPrescription ? (
              <>
                <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>Diagnosis</div>
                  <p style={{ fontSize: '0.95rem' }}>{existingPrescription.diagnosis}</p>
                </div>

                <div style={{ background: 'var(--teal-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(13, 148, 136, 0.2)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--teal)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Pill size={16} /> Prescribed Medications
                  </div>
                  <pre style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {existingPrescription.medications}
                  </pre>
                </div>

                {existingPrescription.advice && (
                  <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Doctor Advice</div>
                    <p style={{ fontSize: '0.9rem' }}>{existingPrescription.advice}</p>
                  </div>
                )}

                {existingPrescription.follow_up_date && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>
                    <Calendar size={16} /> Recommended Follow-up: {existingPrescription.follow_up_date}
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <AlertCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p>No prescription has been issued for this appointment yet.</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
