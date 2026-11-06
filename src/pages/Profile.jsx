import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentApi } from '../services/api';

const AP_DISTRICTS = [
  'Visakhapatnam',
  'Vijayawada (NTR / Krishna)',
  'Guntur',
  'Tirupati (Chittoor)',
  'Nellore (SPSR Nellore)',
  'Kakinada',
  'Rajahmundry (East Godavari)',
  'Ongole (Prakasam)',
  'Kurnool',
  'Kadapa (YSR)',
  'Anantapur',
  'Eluru (West Godavari)',
  'Srikakulam',
  'Vizianagaram',
  'Bapatla',
  'Palnadu (Narasaraopet)',
  'Nandyal',
  'Annamayya (Rayachoti)',
  'Sri Sathya Sai (Puttaparthi)',
  'Other District',
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const AVATAR_OPTIONS = ['👨', '👩', '🧑', '👨‍💼', '👩‍💼', '🧑‍⚕️', '🩺', '👤'];

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const isNewlyRegistered = searchParams.get('new') === 'true' || searchParams.get('complete') === 'true';

  // Form states
  const [isEditing, setIsEditing] = useState(isNewlyRegistered);
  const [isSaving, setIsSaving] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ text: '', type: '' });
  const [errors, setErrors] = useState({});

  // Profile data form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    dateOfBirth: '',
    gender: '',
    state: 'Andhra Pradesh',
    district: '',
    city: '',
    village: '',
    address: '',
    pinCode: '',
    bloodGroup: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    avatar: '',
  });

  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [appointmentTab, setAppointmentTab] = useState('all'); // 'all' | 'upcoming' | 'past' | 'cancelled'
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchAppointmentQuery, setSearchAppointmentQuery] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Sync profile form data with user object
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        age: user.age ? String(user.age) : '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        state: user.state || 'Andhra Pradesh',
        district: user.district || '',
        city: user.city || '',
        village: user.village || '',
        address: user.address || '',
        pinCode: user.pinCode || '',
        bloodGroup: user.bloodGroup || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.emergencyContactPhone || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  // Load patient's appointments from MongoDB
  const loadAppointments = async () => {
    if (!user) {
      setIsLoadingAppointments(false);
      return;
    }

    setIsLoadingAppointments(true);
    try {
      const data = await appointmentApi.getUserAppointments(user.email || '');
      setAppointments(data || []);
    } catch (err) {
      console.error('Error fetching patient appointments:', err);
      try {
        const local = JSON.parse(localStorage.getItem('appointments')) || [];
        setAppointments(
          local.filter((a) => !a.email || a.email.toLowerCase() === user.email.toLowerCase())
        );
      } catch {
        setAppointments([]);
      }
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    if (!user) return 0;
    const fields = [
      user.fullName,
      user.phone,
      user.age || user.dateOfBirth,
      user.gender,
      user.district,
      user.city || user.village,
      user.address,
      user.pinCode,
      user.bloodGroup,
      user.emergencyContactPhone,
    ];
    const filled = fields.filter((f) => Boolean(f && String(f).trim())).length;
    return Math.round((filled / fields.length) * 100);
  };

  const completionPct = calculateCompletion();

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-calculate age if DOB changes
    if (name === 'dateOfBirth' && value) {
      try {
        const birthDate = new Date(value);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        if (calculatedAge >= 0 && calculatedAge <= 130) {
          setFormData((prev) => ({ ...prev, [name]: value, age: String(calculatedAge) }));
        }
      } catch {
        // Ignore date parsing failure
      }
    }

    // Clear specific field validation error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Select Avatar
  const handleSelectAvatar = (avatar) => {
    setFormData((prev) => ({ ...prev, avatar }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Mobile number must be exactly 10 digits';
    }

    if (formData.pinCode && !/^\d{6}$/.test(formData.pinCode.trim())) {
      newErrors.pinCode = 'PIN code must be exactly 6 digits';
    }

    if (formData.age) {
      const numAge = Number(formData.age);
      if (isNaN(numAge) || numAge < 0 || numAge > 130) {
        newErrors.age = 'Age must be a valid number between 0 and 130';
      }
    }

    if (formData.emergencyContactPhone && !/^\d{10}$/.test(formData.emergencyContactPhone.trim())) {
      newErrors.emergencyContactPhone = 'Emergency contact phone must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save profile changes
  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setAlertMessage({ text: 'Please resolve the validation errors highlighted below.', type: 'error' });
      return;
    }

    setIsSaving(true);
    setAlertMessage({ text: '', type: '' });

    try {
      const res = await updateUserProfile({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        age: formData.age ? Number(formData.age) : null,
        dateOfBirth: formData.dateOfBirth.trim(),
        gender: formData.gender,
        state: formData.state.trim() || 'Andhra Pradesh',
        district: formData.district.trim(),
        city: formData.city.trim(),
        village: formData.village.trim(),
        address: formData.address.trim(),
        pinCode: formData.pinCode.trim(),
        bloodGroup: formData.bloodGroup,
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
        avatar: formData.avatar.trim(),
      });

      if (res.success) {
        setAlertMessage({ text: 'Profile updated and saved to MongoDB successfully!', type: 'success' });
        setTimeout(() => {
          setIsEditing(false);
          setAlertMessage({ text: '', type: '' });
        }, 1500);
      } else {
        setAlertMessage({ text: res.message || 'Failed to update profile.', type: 'error' });
      }
    } catch (err) {
      setAlertMessage({ text: err.message || 'Error occurred while saving profile.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel Appointment handler
  const handleCancelAppointment = async (id, doctorName, date, time) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to cancel your consultation with ${doctorName} on ${date} at ${time}?\n\nThis will immediately release the time slot.`
    );

    if (isConfirmed) {
      try {
        const res = await appointmentApi.cancelAppointment(id);
        if (res.success) {
          alert('Appointment cancelled successfully.');
          loadAppointments();
        } else {
          alert(res.message || 'Failed to cancel appointment.');
        }
      } catch (err) {
        console.error('Cancellation error:', err);
        alert('Failed to cancel appointment. Please try again.');
      }
    }
  };

  // Authentication Guard
  if (!user) {
    return (
      <div className="profile-page-container">
        <div className="auth-required-card">
          <div className="auth-lock-icon">🔒</div>
          <h2>Patient Authentication Required</h2>
          <p>
            Please log in or register your account to view your medical profile, manage personal details, and track consultations.
          </p>
          <div className="auth-buttons-row">
            <Link to="/login" className="primary-btn">
              Login to SmartCare
            </Link>
            <Link to="/register" className="secondary-btn">
              Register New Patient
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter Appointments
  const filteredAppointments = appointments.filter((apt) => {
    // Search query filter
    if (searchAppointmentQuery.trim()) {
      const query = searchAppointmentQuery.toLowerCase();
      const matchDoctor = (apt.doctor || apt.doctorName || '').toLowerCase().includes(query);
      const matchHospital = (apt.hospital || apt.hospitalName || '').toLowerCase().includes(query);
      const matchSpec = (apt.specialization || '').toLowerCase().includes(query);
      if (!matchDoctor && !matchHospital && !matchSpec) return false;
    }

    const isCancelled = apt.status === 'Cancelled';
    const isCompleted = apt.status === 'Completed';
    const aptDate = apt.date || apt.appointmentDate || '';

    if (appointmentTab === 'upcoming') {
      return !isCancelled && !isCompleted && aptDate >= todayStr;
    }
    if (appointmentTab === 'past') {
      return !isCancelled && (isCompleted || aptDate < todayStr);
    }
    if (appointmentTab === 'cancelled') {
      return isCancelled;
    }
    return true; // 'all'
  });

  const upcomingCount = appointments.filter((a) => a.status !== 'Cancelled' && a.status !== 'Completed' && (a.date || a.appointmentDate || '') >= todayStr).length;
  const pastCount = appointments.filter((a) => a.status !== 'Cancelled' && (a.status === 'Completed' || (a.date || a.appointmentDate || '') < todayStr)).length;
  const cancelledCount = appointments.filter((a) => a.status === 'Cancelled').length;

  return (
    <div className="profile-page-container">
      {/* Top Banner for New Users */}
      {isNewlyRegistered && (
        <div className="profile-welcome-banner">
          <div className="banner-icon">🎉</div>
          <div>
            <strong>Welcome to SmartCare Andhra Pradesh!</strong>
            <p>Please complete your personal and contact details below so doctors and hospitals have your accurate records.</p>
          </div>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="profile-header-card">
        <div className="profile-header-main">
          <div className="avatar-wrapper">
            <div className="large-avatar-circle">
              {formData.avatar ? (
                formData.avatar.length <= 4 ? (
                  <span className="avatar-emoji-large">{formData.avatar}</span>
                ) : (
                  <img src={formData.avatar} alt="Patient Avatar" className="avatar-img-large" />
                )
              ) : (
                <span className="avatar-initials-large">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : '👤'}
                </span>
              )}
            </div>
          </div>

          <div className="profile-title-details">
            <div className="profile-name-row">
              <h2>{user.fullName}</h2>
              <span className="verified-patient-tag">
                ✓ Verified Patient
              </span>
            </div>
            <p className="profile-sub-contact">
              <span>📧 {user.email}</span>
              <span>📱 {user.phone || 'Mobile not provided'}</span>
              <span>📍 {user.city || user.district ? `${user.city ? user.city + ', ' : ''}${user.district || user.state}` : 'Andhra Pradesh'}</span>
            </p>

            {/* Profile Completion Bar */}
            <div className="completion-bar-container">
              <div className="completion-bar-header">
                <span className="completion-label">Profile Completion:</span>
                <span className="completion-pct-value">{completionPct}%</span>
              </div>
              <div className="completion-progress-track">
                <div
                  className="completion-progress-fill"
                  style={{ width: `${completionPct}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-header-actions">
          <button
            type="button"
            className={isEditing ? 'secondary-btn edit-toggle-btn' : 'primary-btn edit-toggle-btn'}
            onClick={() => {
              setIsEditing(!isEditing);
              setAlertMessage({ text: '', type: '' });
              setErrors({});
            }}
          >
            {isEditing ? '✕ Cancel Editing' : '✏️ Edit Profile'}
          </button>
          <Link to="/doctors" className="secondary-btn book-quick-btn">
            🔍 Book Doctor
          </Link>
        </div>
      </div>

      {/* Alert / Notification banner */}
      {alertMessage.text && (
        <div className={`message-banner ${alertMessage.type}`}>
          {alertMessage.text}
        </div>
      )}

      {/* Profile Details Section: Edit Mode vs View Mode */}
      <div className="profile-content-grid">
        <div className="profile-details-column">
          {isEditing ? (
            /* ================= EDITABLE FORM ================= */
            <div className="profile-section-card">
              <div className="section-card-header">
                <h3>✏️ Edit Personal Details</h3>
                <span className="section-subtitle">Update your contact, location, and health profile information</span>
              </div>

              <form onSubmit={handleSubmitProfile} className="profile-edit-form" noValidate>
                {/* 1. Avatar Picker */}
                <div className="form-sub-section">
                  <label className="form-section-title">Select Avatar / Photo</label>
                  <div className="avatar-picker-row">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        className={`avatar-choice-btn ${formData.avatar === av ? 'selected' : ''}`}
                        onClick={() => handleSelectAvatar(av)}
                      >
                        {av}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`avatar-choice-btn ${formData.avatar === '' ? 'selected' : ''}`}
                      onClick={() => handleSelectAvatar('')}
                      title="Use Initials"
                    >
                      Initials
                    </button>
                  </div>
                  <div className="avatar-custom-url-row">
                    <input
                      type="url"
                      name="avatar"
                      placeholder="Or paste avatar image URL (e.g., https://...)"
                      value={formData.avatar.length > 4 ? formData.avatar : ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* 2. Basic Information */}
                <div className="form-sub-section">
                  <h4 className="form-section-title">👤 Basic Information</h4>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="fullName">
                        Full Name <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. Ravi Kumar"
                        className={errors.fullName ? 'input-error' : ''}
                        required
                      />
                      {errors.fullName && <span className="field-error-msg">{errors.fullName}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">
                        Email Address <span className="readonly-badge">(Account Login)</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="input-disabled"
                        title="Email cannot be changed"
                      />
                    </div>
                  </div>

                  <div className="form-row-3">
                    <div className="form-group">
                      <label htmlFor="phone">Mobile Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit number"
                        maxLength="10"
                        className={errors.phone ? 'input-error' : ''}
                      />
                      {errors.phone && <span className="field-error-msg">{errors.phone}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="age">Age (Years)</label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="e.g. 32"
                        min="0"
                        max="130"
                        className={errors.age ? 'input-error' : ''}
                      />
                      {errors.age && <span className="field-error-msg">{errors.age}</span>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="gender">Gender (Optional)</label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Gender</option>
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="dateOfBirth">Date of Birth (Optional)</label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        max={todayStr}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="bloodGroup">Blood Group (Optional)</label>
                      <select
                        id="bloodGroup"
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Blood Group</option>
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Location & Address Details */}
                <div className="form-sub-section">
                  <h4 className="form-section-title">📍 Residential Address & Location</h4>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="state">State</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Andhra Pradesh"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="district">District (Andhra Pradesh)</label>
                      <select
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                      >
                        <option value="">Select District</option>
                        {AP_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row-3">
                    <div className="form-group">
                      <label htmlFor="city">City or Town</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Vijayawada / Guntur"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="village">Village (Optional)</label>
                      <input
                        type="text"
                        id="village"
                        name="village"
                        value={formData.village}
                        onChange={handleInputChange}
                        placeholder="Village name if applicable"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="pinCode">PIN Code</label>
                      <input
                        type="text"
                        id="pinCode"
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleInputChange}
                        placeholder="6-digit PIN"
                        maxLength="6"
                        className={errors.pinCode ? 'input-error' : ''}
                      />
                      {errors.pinCode && <span className="field-error-msg">{errors.pinCode}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Full Street Address / House No.</label>
                    <textarea
                      id="address"
                      name="address"
                      rows="2"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="e.g. Door No. 4-12, Near Temple Road, Ward 5"
                    ></textarea>
                  </div>
                </div>

                {/* 4. Emergency Contact Details */}
                <div className="form-sub-section">
                  <h4 className="form-section-title">🚨 Emergency Contact (Optional)</h4>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="emergencyContactName">Emergency Contact Person</label>
                      <input
                        type="text"
                        id="emergencyContactName"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleInputChange}
                        placeholder="e.g. Parent, Spouse, or Relative"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="emergencyContactPhone">Emergency Contact Mobile</label>
                      <input
                        type="tel"
                        id="emergencyContactPhone"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile number"
                        maxLength="10"
                        className={errors.emergencyContactPhone ? 'input-error' : ''}
                      />
                      {errors.emergencyContactPhone && (
                        <span className="field-error-msg">{errors.emergencyContactPhone}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="form-actions-bar">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn save-btn" disabled={isSaving}>
                    {isSaving ? 'Saving to Database...' : '💾 Save Profile Details'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ================= VIEW MODE ================= */
            <div className="profile-section-card">
              <div className="section-card-header">
                <h3>📋 Patient Personal Information</h3>
                <button
                  type="button"
                  className="inline-edit-action"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Edit Details
                </button>
              </div>

              <div className="profile-details-display-grid">
                {/* Basic Details */}
                <div className="detail-item-box">
                  <span className="item-label">👤 Full Name</span>
                  <span className="item-value font-medium">{user.fullName || '—'}</span>
                </div>

                <div className="detail-item-box">
                  <span className="item-label">📧 Email Address</span>
                  <span className="item-value font-mono">{user.email || '—'}</span>
                </div>

                <div className="detail-item-box">
                  <span className="item-label">📱 Mobile Phone</span>
                  <span className="item-value font-medium">{user.phone || 'Not provided'}</span>
                </div>

                <div className="detail-item-box">
                  <span className="item-label">🎂 Age / Date of Birth</span>
                  <span className="item-value">
                    {user.age ? `${user.age} Years` : ''}
                    {user.dateOfBirth ? ` (${user.dateOfBirth})` : ''}
                    {!user.age && !user.dateOfBirth ? 'Not specified' : ''}
                  </span>
                </div>

                <div className="detail-item-box">
                  <span className="item-label">⚧ Gender</span>
                  <span className="item-value">{user.gender || 'Not specified'}</span>
                </div>

                <div className="detail-item-box">
                  <span className="item-label">🩸 Blood Group</span>
                  <span className="item-value">
                    {user.bloodGroup ? (
                      <span className="blood-tag">{user.bloodGroup}</span>
                    ) : (
                      'Not specified'
                    )}
                  </span>
                </div>

                {/* Address Details */}
                <div className="detail-item-box">
                  <span className="item-label">🏛️ State</span>
                  <span className="item-value">{user.state || 'Andhra Pradesh'}</span>
                </div>

                <div className="detail-item-box">
                  <span className="item-label">📍 District</span>
                  <span className="item-value">{user.district || 'Not specified'}</span>
                </div>

                <div className="detail-item-box">
                  <span className="item-label">🏙️ City / Town</span>
                  <span className="item-value">{user.city || 'Not specified'}</span>
                </div>

                <div className="detail-item-box">
                  <span className="item-label">🏡 Village</span>
                  <span className="item-value">{user.village || 'Not specified'}</span>
                </div>

                <div className="detail-item-box">
                  <span className="item-label">📮 PIN Code</span>
                  <span className="item-value font-mono">{user.pinCode || 'Not specified'}</span>
                </div>

                <div className="detail-item-box full-span">
                  <span className="item-label">🏠 Full Address</span>
                  <span className="item-value">{user.address || 'Not specified'}</span>
                </div>

                {/* Emergency Details */}
                <div className="detail-item-box">
                  <span className="item-label">🚨 Emergency Contact Name</span>
                  <span className="item-value">{user.emergencyContactName || 'Not specified'}</span>
                </div>

                <div className="detail-item-box">
                  <span className="item-label">📞 Emergency Contact Phone</span>
                  <span className="item-value">{user.emergencyContactPhone || 'Not specified'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= SECTION 3: APPOINTMENT HISTORY ================= */}
      <div className="profile-section-card appointment-history-card">
        <div className="section-card-header history-header-row">
          <div>
            <h3>📅 Appointment History</h3>
            <span className="section-subtitle">
              Your booked consultations with doctors and hospitals in Andhra Pradesh
            </span>
          </div>

          {/* Search within appointments */}
          <div className="history-search-box">
            <input
              type="text"
              placeholder="Search by doctor, hospital, or specialty..."
              value={searchAppointmentQuery}
              onChange={(e) => setSearchAppointmentQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="history-tabs-row">
          <button
            type="button"
            className={`history-tab-btn ${appointmentTab === 'all' ? 'active' : ''}`}
            onClick={() => setAppointmentTab('all')}
          >
            📋 All ({appointments.length})
          </button>
          <button
            type="button"
            className={`history-tab-btn ${appointmentTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setAppointmentTab('upcoming')}
          >
            📅 Upcoming ({upcomingCount})
          </button>
          <button
            type="button"
            className={`history-tab-btn ${appointmentTab === 'past' ? 'active' : ''}`}
            onClick={() => setAppointmentTab('past')}
          >
            ✅ Past / Completed ({pastCount})
          </button>
          <button
            type="button"
            className={`history-tab-btn ${appointmentTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setAppointmentTab('cancelled')}
          >
            🚫 Cancelled ({cancelledCount})
          </button>
        </div>

        {/* Appointments List */}
        <div className="history-appointments-list">
          {isLoadingAppointments ? (
            <div className="loading-box">
              <div className="loading-spinner"></div>
              <p>Fetching your appointment records from MongoDB database...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="no-appointments-box">
              <div className="empty-calendar-icon">🗓️</div>
              <h4>No appointments found</h4>
              <p>
                {searchAppointmentQuery
                  ? `No consultations match "${searchAppointmentQuery}".`
                  : appointmentTab === 'upcoming'
                  ? 'You have no upcoming consultations scheduled.'
                  : appointmentTab === 'past'
                  ? 'No past completed consultations found in your history.'
                  : appointmentTab === 'cancelled'
                  ? 'No cancelled appointments on record.'
                  : 'You have not booked any consultations yet.'}
              </p>
              <div className="empty-actions-row">
                <Link to="/doctors" className="primary-btn">
                  👨‍⚕️ Find Doctors & Book
                </Link>
                <Link to="/hospitals" className="secondary-btn">
                  🏥 Explore AP Hospitals
                </Link>
              </div>
            </div>
          ) : (
            <div className="appointment-cards-grid">
              {filteredAppointments.map((apt, index) => {
                const uniqueKey = apt.id || apt._id || index;
                const isCancelled = apt.status === 'Cancelled';
                const isCompleted = apt.status === 'Completed';
                const aptDate = apt.date || apt.appointmentDate || '';
                const isUpcoming = !isCancelled && !isCompleted && aptDate >= todayStr;

                return (
                  <div
                    key={uniqueKey}
                    className={`history-card ${
                      isCancelled ? 'card-cancelled' : isCompleted ? 'card-completed' : 'card-upcoming'
                    }`}
                  >
                    <div className="history-card-top">
                      <div>
                        <h4 className="card-doctor-name">{apt.doctor || apt.doctorName}</h4>
                        <span className="card-doctor-spec">{apt.specialization || 'Specialist'}</span>
                      </div>
                      <span
                        className={`status-pill ${
                          isCancelled
                            ? 'pill-cancelled'
                            : isCompleted
                            ? 'pill-completed'
                            : 'pill-upcoming'
                        }`}
                      >
                        {apt.status || 'Confirmed'}
                      </span>
                    </div>

                    <div className="history-card-body">
                      <div className="card-info-row">
                        <span className="info-icon">🏥</span>
                        <span className="info-text">
                          <strong>{apt.hospital || apt.hospitalName || 'Hospital'}</strong>
                          {apt.location || apt.locationName ? ` (${apt.location || apt.locationName})` : ''}
                        </span>
                      </div>

                      <div className="card-info-row">
                        <span className="info-icon">📅</span>
                        <span className="info-text">
                          <strong>Date:</strong> {aptDate} &nbsp;|&nbsp; <strong>Time:</strong> {apt.time || apt.appointmentTime}
                        </span>
                      </div>

                      {apt.createdAt && (
                        <div className="card-info-row booking-date-row">
                          <span className="info-icon">🕒</span>
                          <span className="info-text text-muted">
                            Booked on: {new Date(apt.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="history-card-actions">
                      <button
                        type="button"
                        className="details-btn"
                        onClick={() => setSelectedAppointment(apt)}
                      >
                        👁️ View Details
                      </button>

                      {isUpcoming && (
                        <button
                          type="button"
                          className="cancel-btn"
                          onClick={() =>
                            handleCancelAppointment(
                              apt.id || apt._id,
                              apt.doctor || apt.doctorName,
                              aptDate,
                              apt.time || apt.appointmentTime
                            )
                          }
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ================= APPOINTMENT DETAILS MODAL ================= */}
      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div
            className="modal-content appointment-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Consultation Details</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedAppointment(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="appointment-meta-banner">
                <div>
                  <h4>{selectedAppointment.doctor || selectedAppointment.doctorName}</h4>
                  <p className="spec-sub">{selectedAppointment.specialization || 'Specialist'}</p>
                </div>
                <span
                  className={`status-pill ${
                    selectedAppointment.status === 'Cancelled'
                      ? 'pill-cancelled'
                      : selectedAppointment.status === 'Completed'
                      ? 'pill-completed'
                      : 'pill-upcoming'
                  }`}
                >
                  {selectedAppointment.status || 'Confirmed'}
                </span>
              </div>

              <div className="details-modal-grid">
                <div>
                  <span className="detail-modal-label">🏥 Hospital:</span>
                  <span className="detail-modal-value">
                    {selectedAppointment.hospital || selectedAppointment.hospitalName}
                  </span>
                </div>
                <div>
                  <span className="detail-modal-label">📍 Location:</span>
                  <span className="detail-modal-value">
                    {selectedAppointment.location || selectedAppointment.locationName || 'Andhra Pradesh'}
                  </span>
                </div>
                <div>
                  <span className="detail-modal-label">📅 Appointment Date:</span>
                  <span className="detail-modal-value">
                    {selectedAppointment.date || selectedAppointment.appointmentDate}
                  </span>
                </div>
                <div>
                  <span className="detail-modal-label">⏰ Appointment Time:</span>
                  <span className="detail-modal-value">
                    {selectedAppointment.time || selectedAppointment.appointmentTime}
                  </span>
                </div>
                <div>
                  <span className="detail-modal-label">👤 Patient Name:</span>
                  <span className="detail-modal-value">{selectedAppointment.patientName}</span>
                </div>
                <div>
                  <span className="detail-modal-label">📱 Contact Phone:</span>
                  <span className="detail-modal-value">
                    {selectedAppointment.phone || selectedAppointment.patientPhone}
                  </span>
                </div>
                <div>
                  <span className="detail-modal-label">💵 Consultation Fee:</span>
                  <span className="detail-modal-value font-bold text-teal">
                    {selectedAppointment.fee || '₹600'}
                  </span>
                </div>
                <div>
                  <span className="detail-modal-label">🔖 Booking ID:</span>
                  <span className="detail-modal-value font-mono text-sm">
                    {selectedAppointment.id || selectedAppointment._id}
                  </span>
                </div>
              </div>

              {selectedAppointment.reason && (
                <div className="detail-modal-section">
                  <span className="detail-modal-label">📝 Reason for Consultation:</span>
                  <p className="detail-modal-reason">{selectedAppointment.reason}</p>
                </div>
              )}

              {(selectedAppointment.age || selectedAppointment.gender || selectedAppointment.bloodPressure) && (
                <div className="detail-modal-section vitals-box">
                  <span className="detail-modal-label">🩺 Vitals & Health Metrics at Booking:</span>
                  <div className="vitals-chips-row">
                    {selectedAppointment.age && <span>Age: {selectedAppointment.age} yrs</span>}
                    {selectedAppointment.gender && <span>Gender: {selectedAppointment.gender}</span>}
                    {selectedAppointment.bloodPressure && <span>BP: {selectedAppointment.bloodPressure}</span>}
                    {selectedAppointment.weight && <span>Weight: {selectedAppointment.weight} kg</span>}
                  </div>
                </div>
              )}

              {selectedAppointment.createdAt && (
                <p className="modal-created-note">
                  Booked on {new Date(selectedAppointment.createdAt).toLocaleString()} via SmartCare Portal
                </p>
              )}
            </div>

            <div className="modal-footer">
              {selectedAppointment.status !== 'Cancelled' &&
                selectedAppointment.status !== 'Completed' &&
                (selectedAppointment.date || selectedAppointment.appointmentDate) >= todayStr && (
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      const apt = selectedAppointment;
                      setSelectedAppointment(null);
                      handleCancelAppointment(
                        apt.id || apt._id,
                        apt.doctor || apt.doctorName,
                        apt.date || apt.appointmentDate,
                        apt.time || apt.appointmentTime
                      );
                    }}
                  >
                    Cancel Appointment
                  </button>
                )}
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
