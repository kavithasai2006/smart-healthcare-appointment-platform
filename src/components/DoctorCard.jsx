import React from 'react';

const DoctorCard = ({ doctor, onBook, onViewProfile }) => {
  const isSample = doctor.isSample || (doctor.hospital && doctor.hospital.startsWith('[Sample]'));

  return (
    <div className="doctor-card">
      <div className="doctor-image">{doctor.image || '👨‍⚕️'}</div>
      <h3>{doctor.name}</h3>
      <p className="specialization">{doctor.specialization}</p>

      {doctor.hospital && (
        <div className="doctor-hospital-badge" title={doctor.hospital}>
          🏥 {doctor.hospital}
        </div>
      )}

      {isSample && (
        <span className="sample-tag" title="Sample development record">
          🧪 Sample Facility
        </span>
      )}

      {doctor.location && (
        <div className="doctor-location-badge">
          📍 {doctor.location}, AP
        </div>
      )}

      <div className="doctor-meta-row">
        <span className="doctor-rating">⭐ {doctor.rating}</span>
        <span className="doctor-fee">{doctor.fee || '₹500'}</span>
      </div>

      <p className="doctor-exp">⏳ {doctor.experience || '10+ years'}</p>
      <p className="doctor-days">📅 {doctor.availableDays || 'Mon - Sat'}</p>

      {/* Time Slots Preview */}
      {doctor.timeSlots && doctor.timeSlots.length > 0 && (
        <div className="card-slots-preview">
          {doctor.timeSlots.slice(0, 3).map((slot, idx) => (
            <span key={idx} className="slot-pill-mini">
              {slot}
            </span>
          ))}
          {doctor.timeSlots.length > 3 && (
            <span className="slot-pill-more">+{doctor.timeSlots.length - 3} more</span>
          )}
        </div>
      )}

      {/* Compare Profile & Select/Book Actions */}
      <div className="doctor-card-actions">
        {onViewProfile && (
          <button
            type="button"
            className="view-profile-btn"
            onClick={() => onViewProfile(doctor)}
          >
            👤 View Profile
          </button>
        )}
        <button
          type="button"
          className="select-doctor-btn"
          onClick={() => onBook(doctor)}
        >
          📅 Select & Book
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;


