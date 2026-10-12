import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentApi, authApi } from '../services/api';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past' | 'cancelled'
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];

  // Populate profile form from user
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Load appointments securely from Backend
  const loadAppointments = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await appointmentApi.getUserAppointments(user.email || '');
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      // Fallback
      try {
        const saved = JSON.parse(localStorage.getItem('appointments')) || [];
        setAppointments(saved.filter((a) => !a.email || a.email.toLowerCase() === user.email.toLowerCase()));
      } catch {
        setAppointments([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  // Handle appointment cancellation
  const handleCancelAppointment = async (idOrIndex, doctorName, date, time) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to cancel your consultation with ${doctorName || 'the doctor'} on ${date} at ${time}?\n\nThis will immediately release the time slot.`
    );

    if (isConfirmed) {
      try {
        await appointmentApi.cancelAppointment(idOrIndex);
        alert('Appointment has been cancelled successfully.');
        loadAppointments();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('Failed to cancel appointment. Please try again.');
      }
    }
  };

  // Handle safe profile update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage({ text: '', type: '' });

    try {
      const res = await authApi.updateProfile(profileForm.fullName, profileForm.phone);
      if (res.success && res.user) {
        if (setUser) setUser(res.user);
        setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
        setTimeout(() => {
          setIsEditingProfile(false);
          setProfileMessage({ text: '', type: '' });
        }, 1500);
      } else {
        setProfileMessage({ text: res.message || 'Failed to update profile.', type: 'error' });
      }
    } catch (err) {
      setProfileMessage({ text: err.message || 'Error updating profile.', type: 'error' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  if (!user) {
    return (
      <div className="appointments-page">
        <section className="appointments-section">
          <h2>Patient Dashboard</h2>
          <div className="no-appointments-box" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🔒</div>
            <h3>Authentication Required</h3>
            <p className="subtext" style={{ maxWidth: '450px', margin: '0 auto 20px' }}>
              Please login or register to securely access your consultations, medical history, and Andhra Pradesh hospital appointments.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/login" className="primary-btn">
                Log In to Your Account
              </Link>
              <Link to="/register" className="secondary-btn">
                Register New Patient
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Categorize appointments
  const upcomingAppointments = appointments.filter((apt) => {
    const isCancelled = apt.status === 'Cancelled';
    const isCompleted = apt.status === 'Completed';
    const aptDate = apt.date || apt.appointmentDate || '';
    return !isCancelled && !isCompleted && aptDate >= todayStr;
  });

  const pastAppointments = appointments.filter((apt) => {
    const isCancelled = apt.status === 'Cancelled';
    const isCompleted = apt.status === 'Completed';
    const aptDate = apt.date || apt.appointmentDate || '';
    return !isCancelled && (isCompleted || aptDate < todayStr);
  });

  const cancelledAppointments = appointments.filter((apt) => apt.status === 'Cancelled');

  const currentTabAppointments =
    activeTab === 'upcoming'
      ? upcomingAppointments
      : activeTab === 'past'
      ? pastAppointments
      : cancelledAppointments;

  return (
    <div className="appointments-page patient-dashboard">
      <section className="appointments-section">
        <div className="dashboard-title-row">
          <div>
            <h2>Patient Dashboard</h2>
            <p className="section-description">
              Manage your healthcare consultations, view medical appointments, and update your patient profile.
            </p>
          </div>
          {user.role === 'admin' && (
            <Link to="/admin" className="admin-portal-badge">
              ⚙️ Switch to Admin Dashboard
            </Link>
          )}
        </div>

        {/* 1. Patient Profile Summary Card */}
        <div className="patient-profile-card">
          <div className="profile-card-left">
            <div className="patient-avatar-circle">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : '👤'}
            </div>
            <div className="patient-identity-info">
              <h3>{user.fullName}</h3>
              <p className="patient-email">📧 {user.email}</p>
              <p className="patient-phone">📱 {user.phone || 'Phone not provided'}</p>
              <span className="role-tag">🏥 Registered Patient ({user.role || 'patient'})</span>
            </div>
          </div>

          <div className="profile-card-right">
            <button
              type="button"
              className="edit-profile-btn"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
            >
              {isEditingProfile ? '✕ Cancel Edit' : '✏️ Edit Profile'}
            </button>
          </div>
        </div>

        {/* Profile Edit Drawer / Form */}
        {isEditingProfile && (
          <form className="profile-edit-box" onSubmit={handleSaveProfile}>
            <h4>Update Patient Information</h4>
            {profileMessage.text && (
              <div className={`message-banner ${profileMessage.type}`}>
                {profileMessage.text}
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="editFullName">Full Name</label>
                <input
                  type="text"
                  id="editFullName"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editPhone">10-Digit Mobile Phone</label>
                <input
                  type="tel"
                  id="editPhone"
                  pattern="[0-9]{10}"
                  placeholder="10-digit number"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="form-actions-right">
              <button
                type="submit"
                className="primary-btn"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}

        {/* 2. Categorized Appointment Tabs */}
        <div className="dashboard-tabs-bar">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            📅 Upcoming Consultations ({upcomingAppointments.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            📋 Past Consultations ({pastAppointments.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            🚫 Cancelled Bookings ({cancelledAppointments.length})
          </button>
        </div>

        {/* 3. Appointment List Area */}
        <div id="appointmentsList" style={{ marginTop: '20px' }}>
          {isLoading ? (
            <div className="loading-box">
              <div className="loading-spinner"></div>
              <p>Loading your appointments from database...</p>
            </div>
          ) : currentTabAppointments.length === 0 ? (
            <div className="no-appointments-box">
              <p className="no-appointments">
                {activeTab === 'upcoming'
                  ? 'You have no upcoming consultations scheduled.'
                  : activeTab === 'past'
                  ? 'No past completed consultations found in your history.'
                  : 'No cancelled appointments on record.'}
              </p>
              {activeTab === 'upcoming' && (
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <Link to="/doctors" className="primary-btn">
                    Find Doctors & Book
                  </Link>
                  <Link to="/hospitals" className="secondary-btn">
                    Browse Hospitals in AP
                  </Link>
                </div>
              )}
            </div>
          ) : (
            currentTabAppointments.map((apt, index) => {
              const uniqueKey = apt.id || apt._id || index;
              const isCancelled = apt.status === 'Cancelled';
              const isCompleted = apt.status === 'Completed';

              return (
                <div
                  key={uniqueKey}
                  className={`appointment-card ${isCancelled ? 'cancelled-card' : ''} ${isCompleted ? 'completed-card' : ''}`}
                >
                  <div className="appointment-header-row">
                    <div>
                      <h3>{apt.doctor}</h3>
                      <p className="appointment-spec">{apt.specialization}</p>
                    </div>
                    <div className="appointment-badge-group">
                      <span
                        className={`status-badge ${
                          isCancelled
                            ? 'status-cancelled'
                            : isCompleted
                            ? 'status-completed'
                            : 'status-confirmed'
                        }`}
                      >
                        {apt.status || 'Confirmed'}
                      </span>
                    </div>
                  </div>

                  {/* Hospital & Location Banner */}
                  {(apt.hospital || apt.location) && (
                    <div className="appointment-hospital-banner">
                      {apt.hospital && (
                        <span>🏥 <strong>Hospital:</strong> {apt.hospital}</span>
                      )}
                      {apt.location && (
                        <span>📍 <strong>Location:</strong> {apt.location}</span>
                      )}
                      {apt.fee && (
                        <span>💵 <strong>Consultation Fee:</strong> {apt.fee}</span>
                      )}
                    </div>
                  )}

                  {/* Schedule Details */}
                  <div className="appointment-details-grid">
                    <div>
                      <span className="detail-label">📅 Appointment Date:</span>
                      <span className="detail-value">{apt.date || apt.appointmentDate}</span>
                    </div>
                    <div>
                      <span className="detail-label">⏰ Time Slot:</span>
                      <span className="detail-value">{apt.time || apt.appointmentTime}</span>
                    </div>
                    <div>
                      <span className="detail-label">👤 Patient Name:</span>
                      <span className="detail-value">{apt.patientName}</span>
                    </div>
                    <div>
                      <span className="detail-label">📱 Phone:</span>
                      <span className="detail-value">{apt.phone || apt.patientPhone}</span>
                    </div>
                  </div>

                  {/* Reason for visit */}
                  {apt.reason && (
                    <div className="appointment-reason-box">
                      <strong>Reason for Consultation:</strong> {apt.reason}
                    </div>
                  )}

                  {/* Vitals summary if recorded */}
                  {(apt.bloodPressure || apt.age || apt.weight) && (
                    <div className="appointment-vitals-row">
                      {apt.age && <span>Age: {apt.age} yrs</span>}
                      {apt.gender && <span>Gender: {apt.gender}</span>}
                      {apt.bloodPressure && <span>BP: {apt.bloodPressure}</span>}
                      {apt.weight && <span>Weight: {apt.weight} kg</span>}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="appointment-actions-row">
                    {!isCancelled && !isCompleted && (
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() =>
                          handleCancelAppointment(
                            apt._id || apt.id,
                            apt.doctor,
                            apt.date || apt.appointmentDate,
                            apt.time || apt.appointmentTime
                          )
                        }
                      >
                        Cancel Consultation
                      </button>
                    )}

                    {isCancelled && (
                      <span className="cancelled-note">
                        Slot released. You can re-book this or another doctor at any time.
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default Appointments;
