import React, { useState, useEffect } from 'react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  // Load appointments from LocalStorage
  const loadAppointments = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('appointments')) || [];
      setAppointments(saved);
    } catch (error) {
      console.error('Error loading appointments from localStorage:', error);
      setAppointments([]);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Handle appointment cancellation
  const handleCancelAppointment = (idOrIndex) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to cancel this appointment?'
    );

    if (isConfirmed) {
      try {
        const currentAppointments =
          JSON.parse(localStorage.getItem('appointments')) || [];
        
        // Remove either by ID or by index
        const updatedAppointments = currentAppointments.filter(
          (apt, index) => (apt.id ? apt.id !== idOrIndex : index !== idOrIndex)
        );

        localStorage.setItem(
          'appointments',
          JSON.stringify(updatedAppointments)
        );
        setAppointments(updatedAppointments);
        alert('Appointment cancelled successfully.');
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('Failed to cancel appointment. Please try again.');
      }
    }
  };

  return (
    <div className="appointments-page">
      <section className="appointments-section">
        <h2>My Appointments</h2>

        <div id="appointmentsList">
          {appointments.length === 0 ? (
            <p className="no-appointments">No appointments booked yet.</p>
          ) : (
            appointments.map((apt, index) => {
              const uniqueKey = apt.id || index;
              return (
                <div key={uniqueKey} className="appointment-card">
                  <h3>{apt.doctor}</h3>
                  <div className="appointment-details-grid">
                    <p>
                      <strong>Specialization:</strong> {apt.specialization}
                    </p>
                    <p>
                      <strong>Patient:</strong> {apt.patientName}
                    </p>
                    {apt.age && (
                      <p>
                        <strong>Age:</strong> {apt.age} yrs
                      </p>
                    )}
                    {apt.gender && (
                      <p>
                        <strong>Gender:</strong> {apt.gender}
                      </p>
                    )}
                    <p>
                      <strong>Email:</strong> {apt.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {apt.phone}
                    </p>
                    {apt.height && (
                      <p>
                        <strong>Height:</strong> {apt.height} cm
                      </p>
                    )}
                    {apt.weight && (
                      <p>
                        <strong>Weight:</strong> {apt.weight} kg
                      </p>
                    )}
                    {apt.bloodPressure && (
                      <p>
                        <strong>Blood Pressure:</strong> {apt.bloodPressure}
                      </p>
                    )}
                    <p>
                      <strong>Appointment Date:</strong> {apt.date}
                    </p>
                    <p>
                      <strong>Appointment Time:</strong> {apt.time}
                    </p>
                  </div>

                  <button
                    className="cancel-btn"
                    onClick={() => handleCancelAppointment(apt.id || index)}
                  >
                    Cancel Appointment
                  </button>
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
