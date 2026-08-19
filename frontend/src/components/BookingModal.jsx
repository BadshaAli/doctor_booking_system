import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { X, Calendar, Clock, AlertCircle, MapPin } from 'lucide-react';

export const BookingModal = ({ doctor, onClose, onSuccess }) => {
  const { token, showToast, isAuthenticated, user, role, doctorProfile } = useAuth();

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptoms, setSymptoms] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(true);

  useEffect(() => {
    if (!doctor) return;
    const fetchSlots = async () => {
      setFetchingSlots(true);
      try {
        const res = await fetch(`${API_BASE_URL}/doctors/${doctor.id}/slots/`);
        const data = await res.json();
        setAvailableSlots(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching slots:', err);
      } finally {
        setFetchingSlots(false);
      }
    };
    fetchSlots();
  }, [doctor]);

  const filteredSlots = availableSlots.filter(s => s.date === bookingDate && !s.is_booked);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to book an appointment', 'error');
      return;
    }
    // Check if user is an Admin
    if (role === 'ADMIN' || user?.role === 'ADMIN') {
      showToast('System Administrators cannot book appointments. Please sign in with a patient account.', 'error');
      return;
    }
    // Check if the user is a doctor attempting to book themselves
    const isSelfBooking = user?.id === doctor?.user?.id || (doctorProfile && doctorProfile.id === doctor?.id);
    if (isSelfBooking) {
      showToast('Doctors cannot book appointments with themselves.', 'error');
      return;
    }

    if (!selectedSlot) {
      showToast('Please select an available chamber time slot', 'error');
      return;
    }

    if (!symptoms.trim()) {
      showToast('Please describe your symptoms or reason for visit', 'error');
      return;
    }

    setLoading(true);
    try {
      const timeSlotText = `${selectedSlot.start_time} - ${selectedSlot.end_time}`;
      const res = await fetch(`${API_BASE_URL}/appointments/book/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          doctor_id: doctor.id,
          slot_id: selectedSlot.id,
          date: bookingDate,
          time_slot: timeSlotText,
          symptoms: symptoms,
          patient_notes: patientNotes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to book appointment');

      showToast('Appointment successfully booked!', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const doctorName = doctor ? `Dr. ${doctor.user?.first_name || doctor.user?.username} ${doctor.user?.last_name || ''}` : '';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2 className="h3">Book Consultation</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              {doctorName} ({doctor?.specialty}) • <MapPin size={12} style={{ display: 'inline' }} /> {doctor?.district}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label"><Calendar size={15} style={{ display: 'inline', marginRight: '6px' }} /> Select Date</label>
            <input
              type="date"
              className="form-input"
              value={bookingDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setBookingDate(e.target.value);
                setSelectedSlot(null);
              }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label"><Clock size={15} style={{ display: 'inline', marginRight: '6px' }} /> Available Chamber Time Slots</label>

            {fetchingSlots ? (
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Loading chamber slots...</p>
            ) : filteredSlots.length > 0 ? (
              <div className="slots-grid">
                {filteredSlots.map(slot => (
                  <div
                    key={slot.id}
                    className={`slot-pill ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '0.85rem', background: 'var(--warning-light)', borderRadius: 'var(--radius-sm)', color: '#B45309', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} /> No open chamber slots for this date. Try selecting another date.
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Symptoms / Reason for Visit *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe your health problem or reason for visit..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Patient Notes (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Previous test report details, allergies..."
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !selectedSlot}>
              {loading ? 'Booking...' : `Confirm & Book (৳${Number(doctor?.consultation_fee || 0).toLocaleString()})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
