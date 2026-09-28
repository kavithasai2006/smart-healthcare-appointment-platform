import React from 'react';

const DoctorCard = ({ doctor, onBook }) => {
  return (
    <div className="doctor-card">
      <div className="doctor-image">{doctor.image}</div>
      <h3>{doctor.name}</h3>
      <p className="specialization">{doctor.specialization}</p>
      <p className="doctor-rating">⭐ {doctor.rating}</p>
      <p className="doctor-exp">Experience: {doctor.experience}</p>
      <button 
        className="book-btn"
        onClick={() => onBook(doctor)}
      >
        Book Appointment
      </button>
    </div>
  );
};

export default DoctorCard;
