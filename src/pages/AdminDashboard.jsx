import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi, locationApi } from '../services/api';
import { specializations as defaultSpecs } from '../data/doctors';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'hospitals' | 'doctors' | 'locations' | 'appointments'

  // Statistics
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Locations state
  const [locationsList, setLocationsList] = useState([]);
  const [newLocationName, setNewLocationName] = useState('');
  const [locationError, setLocationError] = useState('');
  const [locationSuccess, setLocationSuccess] = useState('');

  // Hospitals state
  const [hospitalsList, setHospitalsList] = useState([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
  const [selectedHospLocFilter, setSelectedHospLocFilter] = useState('');
  const [hospSearch, setHospSearch] = useState('');
  const [showAddHospForm, setShowAddHospForm] = useState(false);
  const [newHospData, setNewHospData] = useState({
    name: '',
    locationName: 'Guntur',
    address: '',
    phone: '',
    rating: 4.8,
    specialties: 'General Medicine, Pediatrics, Cardiology',
  });
  const [hospFormMsg, setHospFormMsg] = useState({ text: '', type: '' });

  // Doctors state
  const [doctorsList, setDoctorsList] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [docFilterHospital, setDocFilterHospital] = useState('');
  const [docFilterSpec, setDocFilterSpec] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const [showAddDocForm, setShowAddDocForm] = useState(false);
  const [newDocData, setNewDocData] = useState({
    name: '',
    specialization: 'Cardiologist',
    hospitalId: '',
    experience: '10 years',
    fee: '₹600',
    availableDays: 'Mon - Sat',
  });
  const [docFormMsg, setDocFormMsg] = useState({ text: '', type: '' });

  // Appointments state
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [apptStatusFilter, setApptStatusFilter] = useState('');
  const [apptDateFilter, setApptDateFilter] = useState('');
  const [apptSearch, setApptSearch] = useState('');
  const [apptActionMsg, setApptActionMsg] = useState({ text: '', type: '' });

  // Security guard check
  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-page">
        <div className="admin-access-denied-card">
          <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>🚫</div>
          <h2>Administrator Access Required</h2>
          <p>
            You do not have permission to view this control panel. Backend role-based access control enforces that only verified system administrators may manage Andhra Pradesh healthcare operations.
          </p>
          <a href="/" className="primary-btn" style={{ marginTop: '20px', display: 'inline-block' }}>
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  // Load stats & locations
  const loadStatsAndLocations = async () => {
    setIsLoadingStats(true);
    try {
      const [sData, locsData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getLocations(),
      ]);
      setStats(sData);
      setLocationsList(locsData || []);
    } catch (err) {
      console.error('Error loading admin overview:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStatsAndLocations();
  }, []);

  // Load hospitals
  const loadHospitals = async () => {
    setIsLoadingHospitals(true);
    try {
      const data = await adminApi.getHospitals();
      setHospitalsList(data || []);
      if (data && data.length > 0 && !newDocData.hospitalId) {
        setNewDocData((prev) => ({ ...prev, hospitalId: data[0]._id || data[0].id }));
      }
    } catch (err) {
      console.error('Error loading hospitals:', err);
    } finally {
      setIsLoadingHospitals(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'hospitals' || activeSection === 'doctors') {
      loadHospitals();
    }
  }, [activeSection]);

  // Load doctors
  const loadDoctors = async () => {
    setIsLoadingDoctors(true);
    try {
      const filters = {};
      if (docFilterHospital) filters.hospital = docFilterHospital;
      if (docFilterSpec) filters.specialization = docFilterSpec;
      if (docSearch) filters.search = docSearch;
      const data = await adminApi.getDoctors(filters);
      setDoctorsList(data || []);
    } catch (err) {
      console.error('Error loading doctors:', err);
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'doctors') {
      loadDoctors();
    }
  }, [activeSection, docFilterHospital, docFilterSpec, docSearch]);

  // Load appointments
  const loadAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      const filters = {};
      if (apptStatusFilter) filters.status = apptStatusFilter;
      if (apptDateFilter) filters.date = apptDateFilter;
      if (apptSearch) filters.search = apptSearch;
      const data = await adminApi.getAppointments(filters);
      setAppointmentsList(data || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'appointments') {
      loadAppointments();
    }
  }, [activeSection, apptStatusFilter, apptDateFilter, apptSearch]);

  // Handle Location Creation
  const handleAddLocation = async (e) => {
    e.preventDefault();
    setLocationError('');
    setLocationSuccess('');
    try {
      const res = await adminApi.createLocation({
        name: newLocationName.trim(),
        state: 'Andhra Pradesh',
      });
      if (res.success) {
        setLocationSuccess(`Location '${newLocationName}' added successfully to Andhra Pradesh.`);
        setNewLocationName('');
        loadStatsAndLocations();
      } else {
        setLocationError(res.message || 'Failed to add location');
      }
    } catch (err) {
      setLocationError(err.message || 'Failed to add location');
    }
  };

  // Handle Hospital Creation
  const handleCreateHospital = async (e) => {
    e.preventDefault();
    setHospFormMsg({ text: '', type: '' });
    try {
      const res = await adminApi.createHospital(newHospData);
      if (res.success) {
        setHospFormMsg({ text: 'Hospital created successfully!', type: 'success' });
        setShowAddHospForm(false);
        loadHospitals();
        loadStatsAndLocations();
      } else {
        setHospFormMsg({ text: res.message || 'Failed to create hospital', type: 'error' });
      }
    } catch (err) {
      setHospFormMsg({ text: err.message || 'Error creating hospital', type: 'error' });
    }
  };

  // Handle Toggle Hospital Active
  const handleToggleHospital = async (id) => {
    try {
      await adminApi.toggleHospitalActive(id);
      loadHospitals();
    } catch (err) {
      alert('Failed to toggle hospital status');
    }
  };

  // Handle Doctor Creation
  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setDocFormMsg({ text: '', type: '' });
    try {
      const res = await adminApi.createDoctor(newDocData);
      if (res.success) {
        setDocFormMsg({ text: 'Doctor registered successfully!', type: 'success' });
        setShowAddDocForm(false);
        loadDoctors();
        loadStatsAndLocations();
      } else {
        setDocFormMsg({ text: res.message || 'Failed to register doctor', type: 'error' });
      }
    } catch (err) {
      setDocFormMsg({ text: err.message || 'Error registering doctor', type: 'error' });
    }
  };

  // Handle Toggle Doctor Active
  const handleToggleDoctor = async (id) => {
    try {
      await adminApi.toggleDoctorActive(id);
      loadDoctors();
    } catch (err) {
      alert('Failed to toggle doctor status');
    }
  };

  // Handle Update Appointment Status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await adminApi.updateAppointmentStatus(id, newStatus);
      if (res.success) {
        setApptActionMsg({ text: `Appointment status updated to ${newStatus}.`, type: 'success' });
        loadAppointments();
        loadStatsAndLocations();
        setTimeout(() => setApptActionMsg({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      setApptActionMsg({ text: 'Failed to update appointment status.', type: 'error' });
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header-row">
        <div>
          <h2>🏥 SmartCare Platform Administration</h2>
          <p className="admin-subtitle">
            Role-Based Health Management Control Panel — Andhra Pradesh Region
          </p>
        </div>
        <div className="admin-user-pill">
          <span>Logged in: <strong>{user.fullName}</strong></span>
          <span className="badge-admin">Verified Administrator</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-nav-tabs">
        <button
          type="button"
          className={`admin-tab-btn ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          📊 System Overview
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeSection === 'hospitals' ? 'active' : ''}`}
          onClick={() => setActiveSection('hospitals')}
        >
          🏥 Hospitals Management
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeSection === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveSection('doctors')}
        >
          👨‍⚕️ Doctors Management
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeSection === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveSection('locations')}
        >
          📍 AP Locations
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeSection === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveSection('appointments')}
        >
          📅 All Consultations
        </button>
      </div>

      {/* SECTION 1: OVERVIEW & STATS */}
      {activeSection === 'overview' && (
        <div className="admin-overview-section">
          {isLoadingStats ? (
            <div className="loading-box"><p>Loading system metrics...</p></div>
          ) : stats ? (
            <div className="admin-stats-grid">
              <div className="stat-card">
                <span className="stat-icon">🏥</span>
                <span className="stat-number">{stats.totalHospitals}</span>
                <span className="stat-title">Registered Hospitals</span>
                <span className="stat-sub">Across 13 AP Districts</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">👨‍⚕️</span>
                <span className="stat-number">{stats.totalDoctors}</span>
                <span className="stat-title">Active Doctors</span>
                <span className="stat-sub">In 15 Specializations</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📍</span>
                <span className="stat-number">{stats.totalLocations}</span>
                <span className="stat-title">AP Locations</span>
                <span className="stat-sub">Andhra Pradesh Network</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📅</span>
                <span className="stat-number">{stats.totalAppointments}</span>
                <span className="stat-title">Total Bookings</span>
                <span className="stat-sub">{stats.activeAppointments} Active | {stats.completedAppointments} Completed</span>
              </div>
            </div>
          ) : null}

          {/* Quick Shortcuts */}
          <div className="admin-quick-actions-card">
            <h3>Administrative Quick Actions</h3>
            <div className="quick-buttons-row">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => { setActiveSection('hospitals'); setShowAddHospForm(true); }}
              >
                ➕ Add New Hospital
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => { setActiveSection('doctors'); setShowAddDocForm(true); }}
              >
                ➕ Register New Doctor
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => { setActiveSection('appointments'); setApptStatusFilter('Confirmed'); }}
              >
                🔍 Inspect Active Bookings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: HOSPITALS MANAGEMENT */}
      {activeSection === 'hospitals' && (
        <div className="admin-management-section">
          <div className="section-toolbar">
            <div className="toolbar-filters">
              <input
                type="text"
                placeholder="Search hospital name or address..."
                value={hospSearch}
                onChange={(e) => setHospSearch(e.target.value)}
                className="filter-input"
              />
              <select
                value={selectedHospLocFilter}
                onChange={(e) => setSelectedHospLocFilter(e.target.value)}
                className="filter-select mini-select"
              >
                <option value="">All AP Locations</option>
                {locationsList.map((loc) => (
                  <option key={loc.name} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="primary-btn"
              onClick={() => setShowAddHospForm(!showAddHospForm)}
            >
              {showAddHospForm ? '✕ Close Form' : '➕ Add Hospital'}
            </button>
          </div>

          {/* Add Hospital Form */}
          {showAddHospForm && (
            <form className="admin-form-card" onSubmit={handleCreateHospital}>
              <h3>Register New Andhra Pradesh Hospital</h3>
              {hospFormMsg.text && (
                <div className={`message-banner ${hospFormMsg.type}`}>{hospFormMsg.text}</div>
              )}
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="hospName">Hospital Name</label>
                  <input
                    type="text"
                    id="hospName"
                    value={newHospData.name}
                    onChange={(e) => setNewHospData({ ...newHospData, name: e.target.value })}
                    placeholder="e.g. Apollo Speciality Hospital"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="hospLoc">Location (AP)</label>
                  <select
                    id="hospLoc"
                    value={newHospData.locationName}
                    onChange={(e) => setNewHospData({ ...newHospData, locationName: e.target.value })}
                    required
                  >
                    {locationsList.map((l) => (
                      <option key={l.name} value={l.name}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="hospAddr">Full Address</label>
                  <input
                    type="text"
                    id="hospAddr"
                    value={newHospData.address}
                    onChange={(e) => setNewHospData({ ...newHospData, address: e.target.value })}
                    placeholder="Street, Landmark, City"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="hospPhone">Contact Phone</label>
                  <input
                    type="text"
                    id="hospPhone"
                    value={newHospData.phone}
                    onChange={(e) => setNewHospData({ ...newHospData, phone: e.target.value })}
                    placeholder="e.g. 0863-2224040"
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="hospSpecs">Key Specialties (Comma-separated)</label>
                  <input
                    type="text"
                    id="hospSpecs"
                    value={newHospData.specialties}
                    onChange={(e) => setNewHospData({ ...newHospData, specialties: e.target.value })}
                    placeholder="e.g. Cardiology, Neurology, General Medicine"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="primary-btn" style={{ marginTop: '15px' }}>
                Save Hospital to Database
              </button>
            </form>
          )}

          {/* Hospitals Table */}
          {isLoadingHospitals ? (
            <div className="loading-box"><p>Loading hospitals...</p></div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Hospital Name</th>
                    <th>Location</th>
                    <th>Phone</th>
                    <th>Doctors</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitalsList
                    .filter((h) => !selectedHospLocFilter || h.locationName === selectedHospLocFilter)
                    .filter((h) => !hospSearch || h.name.toLowerCase().includes(hospSearch.toLowerCase()))
                    .map((hosp) => (
                      <tr key={hosp._id || hosp.id}>
                        <td>
                          <strong>{hosp.name}</strong>
                          {hosp.isSample && <span className="sample-badge-mini">Sample</span>}
                        </td>
                        <td>{hosp.locationName || hosp.city}, AP</td>
                        <td>{hosp.phone}</td>
                        <td><strong>{hosp.doctorCount}</strong> doctors</td>
                        <td>
                          <span className={`pill-badge ${hosp.isActive ? 'badge-active' : 'badge-inactive'}`}>
                            {hosp.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="toggle-status-btn"
                            onClick={() => handleToggleHospital(hosp._id || hosp.id)}
                          >
                            {hosp.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: DOCTORS MANAGEMENT */}
      {activeSection === 'doctors' && (
        <div className="admin-management-section">
          <div className="section-toolbar">
            <div className="toolbar-filters">
              <input
                type="text"
                placeholder="Search doctor by name or specialty..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="filter-input"
              />
              <select
                value={docFilterSpec}
                onChange={(e) => setDocFilterSpec(e.target.value)}
                className="filter-select mini-select"
              >
                <option value="">All Specializations</option>
                {defaultSpecs.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="primary-btn"
              onClick={() => setShowAddDocForm(!showAddDocForm)}
            >
              {showAddDocForm ? '✕ Close Form' : '➕ Register Doctor'}
            </button>
          </div>

          {/* Add Doctor Form */}
          {showAddDocForm && (
            <form className="admin-form-card" onSubmit={handleCreateDoctor}>
              <h3>Register New Medical Professional</h3>
              {docFormMsg.text && (
                <div className={`message-banner ${docFormMsg.type}`}>{docFormMsg.text}</div>
              )}
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="docName">Doctor Name</label>
                  <input
                    type="text"
                    id="docName"
                    value={newDocData.name}
                    onChange={(e) => setNewDocData({ ...newDocData, name: e.target.value })}
                    placeholder="e.g. Dr. K. Venkat Rao"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="docSpec">Specialization</label>
                  <select
                    id="docSpec"
                    value={newDocData.specialization}
                    onChange={(e) => setNewDocData({ ...newDocData, specialization: e.target.value })}
                    required
                  >
                    {defaultSpecs.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="docHosp">Associated Hospital</label>
                  <select
                    id="docHosp"
                    value={newDocData.hospitalId}
                    onChange={(e) => setNewDocData({ ...newDocData, hospitalId: e.target.value })}
                    required
                  >
                    {hospitalsList.map((h) => (
                      <option key={h._id || h.id} value={h._id || h.id}>
                        {h.name} ({h.locationName || h.city})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="docExp">Experience</label>
                  <input
                    type="text"
                    id="docExp"
                    value={newDocData.experience}
                    onChange={(e) => setNewDocData({ ...newDocData, experience: e.target.value })}
                    placeholder="e.g. 12 years"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="docFee">Consultation Fee</label>
                  <input
                    type="text"
                    id="docFee"
                    value={newDocData.fee}
                    onChange={(e) => setNewDocData({ ...newDocData, fee: e.target.value })}
                    placeholder="e.g. ₹600"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="docDays">Available Days</label>
                  <input
                    type="text"
                    id="docDays"
                    value={newDocData.availableDays}
                    onChange={(e) => setNewDocData({ ...newDocData, availableDays: e.target.value })}
                    placeholder="e.g. Mon - Sat"
                  />
                </div>
              </div>
              <button type="submit" className="primary-btn" style={{ marginTop: '15px' }}>
                Save Doctor to Database
              </button>
            </form>
          )}

          {/* Doctors Table */}
          {isLoadingDoctors ? (
            <div className="loading-box"><p>Loading doctors...</p></div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>Specialization</th>
                    <th>Hospital</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorsList.slice(0, 100).map((doc) => (
                    <tr key={doc._id || doc.id}>
                      <td>
                        <strong>{doc.name}</strong>
                        {doc.isSample && <span className="sample-badge-mini">Sample</span>}
                      </td>
                      <td>{doc.specialization}</td>
                      <td>{doc.hospitalName || doc.hospital?.name}</td>
                      <td>{doc.fee || '₹600'}</td>
                      <td>
                        <span className={`pill-badge ${doc.isActive !== false ? 'badge-active' : 'badge-inactive'}`}>
                          {doc.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="toggle-status-btn"
                          onClick={() => handleToggleDoctor(doc._id || doc.id)}
                        >
                          {doc.isActive !== false ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {doctorsList.length > 100 && (
                <p className="subtext" style={{ textAlign: 'center', marginTop: '10px' }}>
                  Showing first 100 of {doctorsList.length} doctors. Filter by hospital or specialty for precise search.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: AP LOCATIONS MANAGEMENT */}
      {activeSection === 'locations' && (
        <div className="admin-management-section">
          <div className="admin-form-card" style={{ marginBottom: '25px' }}>
            <h3>Register Supported Andhra Pradesh Location</h3>
            <p className="subtext">
              Platform policy strictly enforces Andhra Pradesh locations. Non-AP locations cannot be registered.
            </p>
            {locationError && <div className="message-banner error">{locationError}</div>}
            {locationSuccess && <div className="message-banner success">{locationSuccess}</div>}
            <form onSubmit={handleAddLocation} style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
              <input
                type="text"
                placeholder="Enter Andhra Pradesh District / City name..."
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                className="filter-input"
                required
                style={{ flex: 1 }}
              />
              <button type="submit" className="primary-btn">
                Add AP Location
              </button>
            </form>
          </div>

          <div className="admin-table-container">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Location Name</th>
                  <th>State</th>
                  <th>Hospitals</th>
                  <th>Doctors</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {locationsList.map((loc) => (
                  <tr key={loc._id || loc.id}>
                    <td><strong>📍 {loc.name}</strong></td>
                    <td>{loc.state || 'Andhra Pradesh'}</td>
                    <td>{loc.hospitalCount || 12} hospitals</td>
                    <td>{loc.doctorCount || '150+'} doctors</td>
                    <td><span className="pill-badge badge-active">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 5: ALL CONSULTATIONS / APPOINTMENTS */}
      {activeSection === 'appointments' && (
        <div className="admin-management-section">
          <div className="section-toolbar">
            <div className="toolbar-filters">
              <input
                type="text"
                placeholder="Search patient name, phone, or doctor..."
                value={apptSearch}
                onChange={(e) => setApptSearch(e.target.value)}
                className="filter-input"
              />
              <select
                value={apptStatusFilter}
                onChange={(e) => setApptStatusFilter(e.target.value)}
                className="filter-select mini-select"
              >
                <option value="">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <input
                type="date"
                value={apptDateFilter}
                onChange={(e) => setApptDateFilter(e.target.value)}
                className="filter-input mini-select"
              />
            </div>
          </div>

          {apptActionMsg.text && (
            <div className={`message-banner ${apptActionMsg.type}`} style={{ marginBottom: '15px' }}>
              {apptActionMsg.text}
            </div>
          )}

          {isLoadingAppointments ? (
            <div className="loading-box"><p>Loading appointments...</p></div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor & Spec</th>
                    <th>Hospital</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Change Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentsList.map((apt) => (
                    <tr key={apt._id || apt.id}>
                      <td>
                        <strong>{apt.patientName}</strong>
                        <div className="subtext">📞 {apt.patientPhone || apt.phone}</div>
                      </td>
                      <td>
                        <strong>{apt.doctorName || apt.doctor?.name}</strong>
                        <div className="subtext">{apt.specialization}</div>
                      </td>
                      <td>{apt.hospitalName || apt.hospital?.name}</td>
                      <td>
                        <strong>{apt.appointmentDate}</strong>
                        <div className="subtext">⏰ {apt.appointmentTime}</div>
                      </td>
                      <td>
                        <span
                          className={`pill-badge ${
                            apt.status === 'Cancelled'
                              ? 'badge-inactive'
                              : apt.status === 'Completed'
                              ? 'badge-completed'
                              : 'badge-active'
                          }`}
                        >
                          {apt.status || 'Confirmed'}
                        </span>
                      </td>
                      <td>
                        <select
                          value={apt.status || 'Confirmed'}
                          onChange={(e) => handleUpdateStatus(apt._id || apt.id, e.target.value)}
                          className="status-dropdown-select"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
