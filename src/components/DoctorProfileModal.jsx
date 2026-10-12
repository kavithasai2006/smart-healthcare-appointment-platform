import React from 'react';

const DoctorProfileModal = ({ doctor, isOpen, onClose, onSelectDoctor }) => {
  if (!isOpen || !doctor) return null;

  const isSample = doctor.isSample || (doctor.hospital && doctor.hospital.startsWith('[Sample]'));

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal" style={{ display: 'flex' }} onClick={handleBackdropClick}>
      <div className="modal-content doctor-profile-modal-content">
        <span className="close" onClick={onClose} aria-label="Close modal">
          &times;
        </span>

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">{doctor.image || '👨‍⚕️'}</div>
          <div>
            <h2>{doctor.name}</h2>
            <p className="profile-spec">{doctor.specialization}</p>
            {isSample ? (
              <span className="sample-tag">🧪 Sample Development Record</span>
            ) : (
              <span className="verified-tag">✓ Verified Healthcare Specialist</span>
            )}
          </div>
        </div>

        {/* Hospital & Location Banner */}
        <div className="profile-hospital-banner">
          <div>
            <strong>🏥 Hospital:</strong> {doctor.hospital || 'Multi-Speciality Hospital'}
          </div>
          <div>
            <strong>📍 Location:</strong> {doctor.location ? `${doctor.location}, AP` : 'Andhra Pradesh'}
          </div>
        </div>

        {/* Detailed Statistics Grid */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <span className="stat-label">⏳ Experience</span>
            <span className="stat-val">{doctor.experience || '10+ years'}</span>
          </div>
          <div className="profile-stat-card">
            <span className="stat-label">⭐ Rating</span>
            <span className="stat-val">{doctor.rating} / 5.0</span>
          </div>
          <div className="profile-stat-card">
            <span className="stat-label">💵 Consultation Fee</span>
            <span className="stat-val fee-highlight">{doctor.fee || '₹500'}</span>
          </div>
          <div className="profile-stat-card">
            <span className="stat-label">📅 Consultation Days</span>
            <span className="stat-val">{doctor.availableDays || 'Mon - Sat'}</span>
          </div>
        </div>

        {/* Available Time Slots Preview */}
        <div className="profile-slots-section">
          <h3>🕒 Available Time Slots</h3>
          <p className="slots-hint">Appointments can be scheduled on the following daily slots:</p>
          <div className="profile-slots-grid">
            {doctor.timeSlots && doctor.timeSlots.length > 0 ? (
              doctor.timeSlots.map((slot, index) => (
                <span key={index} className="profile-slot-chip">
                  {slot}
                </span>
              ))
            ) : (
              <span className="profile-slot-chip">09:00 AM - 05:00 PM (By Appointment)</span>
            )}
          </div>
        </div>

        {/* Comparison Notice */}
        <div className="profile-comparison-note">
          <p>
            💡 <strong>Doctor Comparison:</strong> You can review multiple doctors in this specialization before making a booking. All bookings are confirmed directly in our database.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="profile-modal-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Back to Doctor List
          </button>
          <button
            type="button"
            className="book-btn"
            style={{ width: 'auto', padding: '12px 24px' }}
            onClick={() => {
              onClose();
              onSelectDoctor(doctor);
            }}
          >
            📅 Select This Doctor & Book
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileModal;
