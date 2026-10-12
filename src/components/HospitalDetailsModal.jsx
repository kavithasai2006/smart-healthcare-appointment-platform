import React, { useState, useEffect } from 'react';
import { doctorApi } from '../services/api';
import DoctorCard from './DoctorCard';

const HospitalDetailsModal = ({ hospital, locationName, isOpen, onClose, onSelectDoctor }) => {
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hospital || !isOpen) return;

    let isMounted = true;
    const loadHospitalData = async () => {
      setIsLoading(true);
      try {
        // Fetch specializations at this hospital
        const specs = await doctorApi.getSpecializations({
          location: locationName || hospital.locationName,
          hospital: hospital.name,
        });

        if (isMounted) {
          setSpecializations(specs || []);
        }

        // Fetch doctors at this hospital
        const docs = await doctorApi.getDoctors({
          location: locationName || hospital.locationName,
          hospital: hospital.name,
          specialization: selectedSpecialization,
        });

        if (isMounted) {
          setDoctors(docs || []);
        }
      } catch (err) {
        console.error('Error loading hospital details and doctors:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadHospitalData();
    return () => {
      isMounted = false;
    };
  }, [hospital, isOpen, selectedSpecialization, locationName]);

  if (!isOpen || !hospital) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content hospital-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* Hospital Header Banner */}
        <div className="hospital-modal-header">
          <div className="hospital-modal-icon">🏥</div>
          <div className="hospital-modal-title-area">
            <h2>{hospital.name}</h2>
            <div className="hospital-modal-badges">
              <span className="location-pill">📍 {hospital.city || hospital.locationName || locationName}, Andhra Pradesh</span>
              <span className="rating-pill">⭐ {hospital.rating || 4.8} / 5.0</span>
              {hospital.isSample && (
                <span className="sample-tag">🧪 Sample Development Facility</span>
              )}
            </div>
          </div>
        </div>

        {/* Hospital Info Grid */}
        <div className="hospital-modal-info-grid">
          <div className="info-item">
            <span className="info-label">📍 Address</span>
            <span className="info-value">{hospital.address || 'Andhra Pradesh, India'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">📞 Contact Phone</span>
            <span className="info-value">{hospital.phone || '0863-2224040'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">🩺 Key Specialties</span>
            <div className="specialty-pills">
              {(hospital.specialties || []).map((spec, i) => (
                <span key={i} className="specialty-pill">{spec}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Doctor Discovery Area at this Hospital */}
        <div className="hospital-doctors-section">
          <div className="hospital-doctors-filter-row">
            <div>
              <h3>Available Specialists at this Hospital ({doctors.length})</h3>
              <p className="subtext">Select a specialization or compare doctors below:</p>
            </div>

            <div className="spec-filter-box">
              <label htmlFor="hospSpecSelect">Filter Specialization:</label>
              <select
                id="hospSpecSelect"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="filter-select mini-select"
              >
                <option value="">All Specializations at this Hospital</option>
                {specializations.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-box" style={{ padding: '30px 0' }}>
              <div className="loading-spinner"></div>
              <p>Loading available doctors...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="no-doctors-box" style={{ padding: '30px 0' }}>
              <p>No doctors currently found for this specialization at this hospital.</p>
            </div>
          ) : (
            <div className="hospital-modal-doctors-list">
              {doctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id || doctor._id}
                  doctor={doctor}
                  onBook={(doc) => {
                    onClose();
                    onSelectDoctor(doc);
                  }}
                  onViewProfile={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalDetailsModal;
