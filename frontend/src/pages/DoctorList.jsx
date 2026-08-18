import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import { DoctorCard } from '../components/DoctorCard';
import { BookingModal } from '../components/BookingModal';
import { Search, Filter, Stethoscope, Star, Calendar, Grid, List, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [sortBy, setSortBy] = useState('-rating');
  const [viewMode, setViewMode] = useState('grid');
  const [bookingDoctor, setBookingDoctor] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        query: searchQuery,
        specialty: selectedSpecialty,
        district: selectedDistrict,
        sort_by: sortBy
      });
      const res = await fetch(`${API_BASE_URL}/doctors/?${queryParams.toString()}`);
      const data = await res.json();
      setDoctors(data.doctors || []);
      setSpecialties(['All', ...(data.specialties || [])]);
      setDistricts(['All', ...(data.districts || [])]);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, selectedDistrict, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div>
      {/* Top Banner */}
      <div className="clinical-card" style={{ padding: '1.75rem 2rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)', color: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.2)', padding: '0.25rem 0.65rem', borderRadius: '4px', textTransform: 'uppercase' }}>
              Bangladesh Medical Directory
            </span>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.5rem' }}>
              Famous Specialist Doctors in Bangladesh
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#DBEAFE', marginTop: '0.2rem' }}>
              Find BMDC registered specialists across Dhaka, Chittagong, Sylhet, Rajshahi and other districts.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', background: '#FFFFFF', padding: '0.45rem', borderRadius: 'var(--radius-sm)', width: '100%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, paddingLeft: '0.5rem' }}>
              <Search size={18} color="var(--primary)" />
              <input
                type="text"
                placeholder="Search doctor, specialty, hospital, district..."
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.875rem', color: 'var(--text-main)' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="clinical-card" style={{ padding: '1.15rem 1.25rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* District (Area) Filter Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <MapPin size={15} color="var(--primary)" /> Filter by District (Area):
          </span>
          {districts.map((dist) => (
            <button
              key={dist}
              onClick={() => setSelectedDistrict(dist)}
              className={`btn btn-sm ${selectedDistrict === dist ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: '4px', fontSize: '0.775rem' }}
            >
              {dist}
            </button>
          ))}
        </div>

        {/* Specialty Filter & Controls Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Filter size={14} /> Specialty:
            </span>
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`btn btn-sm ${selectedSpecialty === spec ? 'btn-secondary' : 'btn-outline'}`}
                style={{ borderRadius: '4px', fontSize: '0.775rem' }}
              >
                {spec}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sort:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="-rating">Highest Rated</option>
                <option value="-experience_years">Most Experienced</option>
                <option value="consultation_fee">Lowest Fee (৳)</option>
                <option value="-consultation_fee">Highest Fee (৳)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.2rem', background: 'var(--bg-app)', padding: '2px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <button
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '4px 8px' }}
                onClick={() => setViewMode('grid')}
                title="Card View"
              >
                <Grid size={16} />
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '4px 8px' }}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Doctors Display */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Stethoscope size={36} className="animate-spin" style={{ marginBottom: '0.75rem' }} />
          <p>Loading Bangladeshi specialist doctors...</p>
        </div>
      ) : doctors.length > 0 ? (
        viewMode === 'grid' ? (
          /* Card View Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onBookClick={(doc) => setBookingDoctor(doc)}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="clinical-table-container">
            <table className="clinical-table">
              <thead>
                <tr>
                  <th>Doctor Specialist</th>
                  <th>Specialty & Hospital</th>
                  <th>District (Area)</th>
                  <th>Experience</th>
                  <th>Rating</th>
                  <th>Fee</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => {
                  const docName = `Dr. ${doc.user?.first_name || doc.user?.username} ${doc.user?.last_name || ''}`;
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <img
                            src={doc.image_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80'}
                            alt={docName}
                            style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.925rem' }}>{docName}</strong>
                            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{doc.qualification}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-specialty" style={{ marginBottom: '0.2rem' }}>{doc.specialty}</span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.hospital}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                          <MapPin size={12} style={{ display: 'inline', marginRight: '3px' }} />
                          {doc.district}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{doc.experience_years} Years</strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B', fontWeight: 700 }}>
                          <Star size={14} fill="#F59E0B" /> {doc.rating}
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({doc.total_reviews})</span>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>৳{Number(doc.consultation_fee).toLocaleString()}</strong>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <Link to={`/doctor/${doc.id}`} className="btn btn-outline btn-sm">
                            Profile
                          </Link>
                          <button className="btn btn-primary btn-sm" onClick={() => setBookingDoctor(doc)}>
                            <Calendar size={14} /> Book
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="clinical-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>No Bangladeshi doctors found matching District: <strong>{selectedDistrict}</strong> & Specialty: <strong>{selectedSpecialty}</strong></p>
          <button className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => { setSearchQuery(''); setSelectedSpecialty('All'); setSelectedDistrict('All'); }}>
            Reset Filters
          </button>
        </div>
      )}

      {/* Booking Modal */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          onSuccess={() => fetchDoctors()}
        />
      )}
    </div>
  );
};
