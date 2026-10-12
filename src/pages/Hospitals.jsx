import React, { useState, useEffect } from 'react';
import { locationApi, hospitalApi } from '../services/api';
import HospitalDetailsModal from '../components/HospitalDetailsModal';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Hospitals = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('Visakhapatnam');
  const [hospitals, setHospitals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [selectedHospitalForModal, setSelectedHospitalForModal] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Load locations on mount
  useEffect(() => {
    let isMounted = true;
    const fetchLocations = async () => {
      try {
        const locs = await locationApi.getLocations();
        if (isMounted && Array.isArray(locs)) {
          setLocations(locs);
          if (!selectedLocation && locs.length > 0) {
            setSelectedLocation(locs[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };
    fetchLocations();
    return () => { isMounted = false; };
  }, []);

  // Fetch hospitals whenever selectedLocation changes
  useEffect(() => {
    let isMounted = true;
    const fetchHospitals = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const list = await hospitalApi.getHospitalListWithDetails(selectedLocation);
        if (isMounted) {
          setHospitals(list || []);
        }
      } catch (err) {
        console.error('Error fetching hospitals:', err);
        if (isMounted) {
          setError('Failed to load hospitals for this location. Please try again.');
          setHospitals([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (selectedLocation) {
      fetchHospitals();
    }
    return () => { isMounted = false; };
  }, [selectedLocation]);

  // Extract all unique specialties for the active location's hospitals
  const availableSpecialties = Array.from(
    new Set(hospitals.flatMap((h) => h.specialties || []))
  ).sort();

  // Filter hospitals by search text and specialty
  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch =
      !searchQuery.trim() ||
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.address && h.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecialty =
      !specialtyFilter ||
      (h.specialties && h.specialties.some((s) => s.toLowerCase() === specialtyFilter.toLowerCase()));

    return matchesSearch && matchesSpecialty;
  });

  const handleOpenDetails = (hospital) => {
    setSelectedHospitalForModal(hospital);
    setIsDetailsModalOpen(true);
  };

  const handleBookDoctor = (doctor) => {
    if (!user) {
      alert('Please login before booking an appointment.');
      navigate('/login');
      return;
    }
    setBookingDoctor(doctor);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="hospitals-page">
      <section className="hospitals-hero">
        <h2>Smart Hospital Finder — Andhra Pradesh</h2>
        <p className="section-description">
          Discover verified multi-speciality hospitals, regional medical centers, and expert doctors across Andhra Pradesh.
        </p>

        {/* Workflow Stepper */}
        <div className="booking-stepper">
          <div className="step-item completed">
            <span className="step-number">1</span>
            <span className="step-label">Select AP Location</span>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-item active">
            <span className="step-number">2</span>
            <span className="step-label">Discover Hospitals</span>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-item">
            <span className="step-number">3</span>
            <span className="step-label">View Doctors</span>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-item">
            <span className="step-number">4</span>
            <span className="step-label">Book Appointment</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="filter-controls-card">
          <div className="filter-grid">
            {/* 1. Location Selector */}
            <div className="filter-group">
              <label htmlFor="hospLocationSelect">📍 Select Location (Andhra Pradesh)</label>
              <select
                id="hospLocationSelect"
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setSearchQuery('');
                  setSpecialtyFilter('');
                }}
                className="filter-select"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Specialty Filter */}
            <div className="filter-group">
              <label htmlFor="hospSpecialtyFilter">🩺 Filter by Specialty</label>
              <select
                id="hospSpecialtyFilter"
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Specialties</option>
                {availableSpecialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Search Box */}
            <div className="filter-group">
              <label htmlFor="hospSearchInput">🔍 Search Hospital / Area</label>
              <input
                type="text"
                id="hospSearchInput"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospital by name or area..."
                className="filter-input"
              />
            </div>
          </div>

          <div className="filter-actions-row">
            <span className="results-count">
              Found <strong>{filteredHospitals.length}</strong> hospital{filteredHospitals.length === 1 ? '' : 's'} in {selectedLocation}
            </span>
            {(searchQuery || specialtyFilter) && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSpecialtyFilter('');
                }}
              >
                Reset Filters ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Hospital Listing Section */}
      <section className="hospitals-list-section">
        {isLoading ? (
          <div className="loading-box">
            <div className="loading-spinner"></div>
            <p>Finding hospitals in {selectedLocation}...</p>
          </div>
        ) : error ? (
          <div className="no-doctors-box">
            <p className="no-appointments">{error}</p>
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="no-doctors-box">
            <p className="no-appointments">
              No hospitals found matching "{searchQuery || specialtyFilter}" in {selectedLocation}.
            </p>
            <button
              type="button"
              className="primary-btn"
              style={{ marginTop: '12px' }}
              onClick={() => {
                setSearchQuery('');
                setSpecialtyFilter('');
              }}
            >
              Clear Search & Show All Hospitals in {selectedLocation}
            </button>
          </div>
        ) : (
          <div className="hospitals-grid">
            {filteredHospitals.map((hosp) => (
              <div key={hosp.id || hosp._id} className="hospital-card">
                <div className="hospital-card-header">
                  <div className="hospital-icon-badge">🏥</div>
                  <div className="hospital-title-area">
                    <h3>{hosp.name}</h3>
                    <span className="hospital-location-tag">📍 {hosp.city || hosp.locationName || selectedLocation}, AP</span>
                  </div>
                </div>

                <div className="hospital-card-meta">
                  <span className="rating-pill">⭐ {hosp.rating || 4.8} / 5.0</span>
                  {hosp.isSample ? (
                    <span className="sample-tag" title="Sample development record">
                      🧪 Sample Facility
                    </span>
                  ) : (
                    <span className="verified-badge" title="Verified healthcare institution">
                      ✓ Verified Institution
                    </span>
                  )}
                </div>

                <p className="hospital-address">
                  <strong>Address:</strong> {hosp.address || `${hosp.city}, Andhra Pradesh`}
                </p>
                <p className="hospital-phone">
                  <strong>Contact:</strong> 📞 {hosp.phone || '0863-2224040'}
                </p>

                {hosp.specialties && hosp.specialties.length > 0 && (
                  <div className="hospital-specialties-row">
                    <strong>Specialties:</strong>
                    <div className="specialty-chips">
                      {hosp.specialties.slice(0, 4).map((spec, idx) => (
                        <span key={idx} className="spec-chip">
                          {spec}
                        </span>
                      ))}
                      {hosp.specialties.length > 4 && (
                        <span className="spec-chip-more">+{hosp.specialties.length - 4} more</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="hospital-card-actions">
                  <button
                    type="button"
                    className="view-hospital-btn"
                    onClick={() => handleOpenDetails(hosp)}
                  >
                    🏥 View Details & Doctors
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Hospital Details & Doctors Modal */}
      {selectedHospitalForModal && (
        <HospitalDetailsModal
          hospital={selectedHospitalForModal}
          locationName={selectedLocation}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onSelectDoctor={handleBookDoctor}
        />
      )}

      {/* Booking Modal */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setBookingDoctor(null);
          }}
        />
      )}
    </div>
  );
};

export default Hospitals;
