import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { specializations } from '../data/doctors';
import DoctorCard from '../components/DoctorCard';
import BookingModal from '../components/BookingModal';
import DoctorProfileModal from '../components/DoctorProfileModal';
import { useAuth } from '../context/AuthContext';
import { locationApi, hospitalApi, doctorApi } from '../services/api';

const Doctors = () => {
  const [searchParams] = useSearchParams();
  const [locationsList, setLocationsList] = useState([]);
  const [hospitalsList, setHospitalsList] = useState([]);
  const [availableSpecializations, setAvailableSpecializations] = useState(specializations);
  const [doctorsList, setDoctorsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Initialize filters (supporting URL search parameters if provided)
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [selectedHospital, setSelectedHospital] = useState(searchParams.get('hospital') || '');
  const [selectedSpecialization, setSelectedSpecialization] = useState(searchParams.get('specialization') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Profile modal state for doctor comparison
  const [profileDoctor, setProfileDoctor] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Load locations from Express API on mount
  useEffect(() => {
    let isMounted = true;
    const loadLocations = async () => {
      try {
        const locs = await locationApi.getLocations();
        if (isMounted && Array.isArray(locs)) {
          setLocationsList(locs);
        }
      } catch (err) {
        console.error('Error loading locations from backend:', err);
      }
    };
    loadLocations();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update available hospitals from Express API whenever selectedLocation changes
  useEffect(() => {
    let isMounted = true;
    const fetchHospitals = async () => {
      if (!selectedLocation) {
        setHospitalsList([]);
        return;
      }

      try {
        const hosps = await hospitalApi.getHospitals(selectedLocation);
        if (isMounted && Array.isArray(hosps)) {
          setHospitalsList(hosps);
        }
      } catch (err) {
        console.error('Error fetching hospitals from backend:', err);
        if (isMounted) setHospitalsList([]);
      }
    };

    fetchHospitals();
    return () => {
      isMounted = false;
    };
  }, [selectedLocation]);

  // Update available specializations when location or hospital changes
  useEffect(() => {
    let isMounted = true;
    const loadSpecializations = async () => {
      if (!selectedLocation) {
        setAvailableSpecializations(specializations);
        return;
      }

      try {
        const specs = await doctorApi.getSpecializations({
          location: selectedLocation,
          hospital: selectedHospital,
        });
        if (isMounted && Array.isArray(specs) && specs.length > 0) {
          setAvailableSpecializations(specs);
        } else if (isMounted && !selectedHospital) {
          setAvailableSpecializations(specializations);
        }
      } catch (err) {
        console.error('Error loading specializations:', err);
        if (isMounted && !selectedHospital) {
          setAvailableSpecializations(specializations);
        }
      }
    };

    loadSpecializations();
    return () => {
      isMounted = false;
    };
  }, [selectedLocation, selectedHospital]);

  // Fetch doctors from Express API whenever filters change
  const fetchDoctors = async () => {
    // Critical requirement: If no location is selected, do NOT dump all 2,538 doctors
    if (!selectedLocation) {
      setDoctorsList([]);
      setIsLoading(false);
      setApiError(null);
      return;
    }

    setIsLoading(true);
    setApiError(null);
    try {
      const docs = await doctorApi.getDoctors({
        location: selectedLocation,
        hospital: selectedHospital,
        specialization: selectedSpecialization,
        search: searchQuery,
      });

      // Deduplicate doctors by unique ID to prevent identical cards
      const uniqueDocs = [];
      const seen = new Set();
      (docs || []).forEach((d) => {
        const key = d.id || d._id;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueDocs.push(d);
        }
      });

      setDoctorsList(uniqueDocs);
    } catch (err) {
      console.error('Error fetching doctors from backend:', err);
      setApiError(err.message || 'Failed to fetch doctors from server');
      setDoctorsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedLocation, selectedHospital, selectedSpecialization, searchQuery]);

  // Handle location change & reset downstream hospital and specialization
  const handleLocationChange = (e) => {
    const loc = e.target.value;
    setSelectedLocation(loc);
    setSelectedHospital('');
    setSelectedSpecialization('');
  };

  // Quick-select button handler
  const handleSelectLocationQuick = (loc) => {
    setSelectedLocation(loc);
    setSelectedHospital('');
    setSelectedSpecialization('');
  };

  // Handle hospital change & reset downstream specialization
  const handleHospitalChange = (e) => {
    setSelectedHospital(e.target.value);
    setSelectedSpecialization('');
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSelectedLocation('');
    setSelectedHospital('');
    setSelectedSpecialization('');
    setSearchQuery('');
  };

  const filteredDoctors = doctorsList;

  // Handle doctor profile preview click
  const handleViewProfile = (doctor) => {
    setProfileDoctor(doctor);
    setIsProfileModalOpen(true);
  };

  // Handle appointment booking button click (select specific doctor)
  const handleBookClick = (doctor) => {
    if (!user) {
      alert('Please login before booking an appointment.');
      navigate('/login');
      return;
    }

    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  const isAnyFilterActive = Boolean(
    selectedLocation || selectedHospital || selectedSpecialization || searchQuery.trim()
  );

  return (
    <div className="doctors-page">
      <section className="doctors-section">
        <h2>Find a Doctor in Andhra Pradesh</h2>
        <p className="section-description">
          Follow the workflow: Select your <strong>Location</strong> → Choose a <strong>Hospital</strong> → Filter by <strong>Specialization</strong> → Compare & Select a <strong>Doctor</strong> → Book your Appointment.
        </p>

        {/* Workflow Step Guide */}
        <div className="booking-stepper">
          <div className={`step-item ${selectedLocation ? 'completed' : 'active'}`}>
            <span className="step-number">1</span>
            <span className="step-label">Location (AP)</span>
          </div>
          <div className="step-arrow">→</div>
          <div className={`step-item ${selectedHospital ? 'completed' : selectedLocation ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Hospital</span>
          </div>
          <div className="step-arrow">→</div>
          <div className={`step-item ${selectedSpecialization ? 'completed' : selectedHospital ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Specialization</span>
          </div>
          <div className="step-arrow">→</div>
          <div className={`step-item ${selectedDoctor ? 'completed' : selectedSpecialization || selectedHospital ? 'active' : ''}`}>
            <span className="step-number">4</span>
            <span className="step-label">Doctor & Booking</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="filter-controls-card">
          <div className="filter-grid">
            {/* 1. Location Selection (Andhra Pradesh) */}
            <div className="filter-group">
              <label htmlFor="locationSelect">📍 Location (Andhra Pradesh)</label>
              <select
                id="locationSelect"
                value={selectedLocation}
                onChange={handleLocationChange}
                className="filter-select"
              >
                <option value="">-- Select an AP Location --</option>
                {locationsList.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Hospital Selection */}
            <div className="filter-group">
              <label htmlFor="hospitalSelect">🏥 Hospital</label>
              <select
                id="hospitalSelect"
                value={selectedHospital}
                onChange={handleHospitalChange}
                disabled={!selectedLocation}
                className="filter-select"
              >
                <option value="">
                  {selectedLocation
                    ? `All Hospitals in ${selectedLocation} (${hospitalsList.length} available)`
                    : '← Select an AP Location first'}
                </option>
                {hospitalsList.map((hosp) => (
                  <option key={hosp} value={hosp}>
                    {hosp}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Specialization Selection */}
            <div className="filter-group">
              <label htmlFor="specSelect">🩺 Specialization</label>
              <select
                id="specSelect"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                disabled={!selectedLocation}
                className="filter-select"
              >
                <option value="">
                  {!selectedLocation
                    ? '← Select an AP Location first'
                    : selectedHospital
                    ? `All Specializations at ${selectedHospital} (${availableSpecializations.length} available)`
                    : `All Specializations in ${selectedLocation}`}
                </option>
                {availableSpecializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Text Search */}
            <div className="filter-group">
              <label htmlFor="doctorSearch">🔍 Search Doctor / Keyword</label>
              <input
                type="text"
                id="doctorSearch"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by doctor name or specialty..."
                className="filter-input"
              />
            </div>
          </div>

          {/* Active Filter Summary & Clear Button */}
          <div className="filter-actions-row">
            <span className="results-count">
              {!selectedLocation ? (
                <>📍 Please select an Andhra Pradesh location to view available doctors.</>
              ) : (
                <>
                  Showing <strong>{filteredDoctors.length}</strong> doctor{filteredDoctors.length === 1 ? '' : 's'} available
                  {selectedSpecialization && ` in ${selectedSpecialization}`}
                  {selectedHospital && ` at ${selectedHospital}`}
                  {selectedLocation && ` in ${selectedLocation}`}
                </>
              )}
            </span>
            {isAnyFilterActive && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={handleResetFilters}
              >
                Reset Filters ✕
              </button>
            )}
          </div>
        </div>

        {/* Doctor Grid, Loading Indicator, Guidance Prompt, or Empty State */}
        {isLoading ? (
          <div className="loading-box">
            <div className="loading-spinner"></div>
            <p>Fetching matching doctors from MongoDB...</p>
          </div>
        ) : apiError ? (
          <div className="error-box">
            <p>⚠️ {apiError}</p>
            <button
              type="button"
              className="primary-btn"
              style={{ marginTop: '12px' }}
              onClick={fetchDoctors}
            >
              Retry
            </button>
          </div>
        ) : !selectedLocation ? (
          /* Clear Guidance State before location is selected */
          <div className="no-doctors-box select-location-prompt">
            <div style={{ fontSize: '3.2rem', marginBottom: '14px' }}>📍</div>
            <h3>Select an Andhra Pradesh Location to Begin</h3>
            <p className="no-appointments" style={{ maxWidth: '580px', margin: '0 auto 18px', boxShadow: 'none', padding: '0' }}>
              Choose your city or district in Andhra Pradesh from the dropdown above to discover verified multi-speciality hospitals and book consultations with specialist doctors.
            </p>
            {locationsList.length > 0 && (
              <div className="quick-locations-row">
                <span>Quick Select:</span>
                {locationsList.slice(0, 7).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    className="quick-loc-chip"
                    onClick={() => handleSelectLocationQuick(loc)}
                  >
                    📍 {loc}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : filteredDoctors.length > 0 ? (
          <>
            {/* Status note when hospital has fewer than 5 matching doctors */}
            {selectedHospital && selectedSpecialization && filteredDoctors.length < 5 && (
              <div className="doctor-shortage-note">
                ℹ️ <strong>Doctor Availability:</strong> Showing all {filteredDoctors.length} available {selectedSpecialization} doctor(s) at {selectedHospital}. This hospital currently has fewer than 5 matching specialists. You can also view more doctors by selecting "All Hospitals in {selectedLocation || 'Andhra Pradesh'}" above.
              </div>
            )}

            {/* Status note when multiple doctors are available for comparison */}
            {filteredDoctors.length >= 5 && (
              <div className="doctor-results-banner">
                <span>✨ <strong>Multiple Specialists Available:</strong> Found {filteredDoctors.length} doctors in {selectedHospital || selectedLocation}. Compare their experience, consultation fees, and available time slots to choose your preferred doctor.</span>
              </div>
            )}

            <div className="doctor-container">
              {filteredDoctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id || doctor._id}
                  doctor={doctor}
                  onBook={handleBookClick}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="no-doctors-box">
            <p className="no-appointments">
              No doctors found matching the selected filters
              {selectedSpecialization && ` for "${selectedSpecialization}"`}
              {selectedHospital && ` at ${selectedHospital}`}
              {selectedLocation && ` in ${selectedLocation}`}.
            </p>
            {isAnyFilterActive && (
              <button
                type="button"
                className="primary-btn"
                style={{ marginTop: '15px' }}
                onClick={handleResetFilters}
              >
                Clear Filters & View All Doctors in {selectedLocation}
              </button>
            )}
          </div>
        )}
      </section>

      {/* Doctor Profile Comparison Modal */}
      {profileDoctor && (
        <DoctorProfileModal
          doctor={profileDoctor}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSelectDoctor={handleBookClick}
        />
      )}

      {/* Appointment Booking Modal */}
      {selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Doctors;
