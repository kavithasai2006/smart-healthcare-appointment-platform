import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BookingModal = ({ doctor, isOpen, onClose, onBookingSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Controlled form state
  const [formData, setFormData] = useState({
    patientName: user ? user.fullName : '',
    age: '',
    gender: '',
    email: user ? user.email : '',
    phone: '',
    height: '',
    weight: '',
    bloodPressure: '',
    date: '',
    time: '',
  });

  const [error, setError] = useState('');

  if (!isOpen || !doctor) return null;

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Close modal when clicking on the dark backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Form submission & validation
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Extra validation checks
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits (numbers only).');
      return;
    }

    const ageNum = Number(formData.age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('Age must be between 1 and 120.');
      return;
    }

    const heightNum = Number(formData.height);
    if (isNaN(heightNum) || heightNum < 30 || heightNum > 250) {
      setError('Height must be between 30 cm and 250 cm.');
      return;
    }

    const weightNum = Number(formData.weight);
    if (isNaN(weightNum) || weightNum < 1 || weightNum > 300) {
      setError('Weight must be between 1 kg and 300 kg.');
      return;
    }

    if (!formData.gender) {
      setError('Please select a gender.');
      return;
    }

    if (!formData.time) {
      setError('Please select an appointment time.');
      return;
    }

    // Create appointment object
    const newAppointment = {
      id: Date.now(),
      doctor: doctor.name,
      specialization: doctor.specialization,
      patientName: formData.patientName.trim(),
      age: ageNum,
      gender: formData.gender,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      height: heightNum,
      weight: weightNum,
      bloodPressure: formData.bloodPressure.trim(),
      date: formData.date,
      time: formData.time,
    };

    try {
      const existingAppointments =
        JSON.parse(localStorage.getItem('appointments')) || [];
      existingAppointments.push(newAppointment);
      localStorage.setItem('appointments', JSON.stringify(existingAppointments));

      alert('Appointment booked successfully!');

      if (onBookingSuccess) {
        onBookingSuccess();
      }

      onClose();
      navigate('/appointments');
    } catch (err) {
      console.error('Error saving appointment:', err);
      setError('Failed to book appointment. Please try again.');
    }
  };

  return (
    <div className="modal" style={{ display: 'flex' }} onClick={handleBackdropClick}>
      <div className="modal-content">
        <span className="close" onClick={onClose} aria-label="Close modal">
          &times;
        </span>

        <h2>Book Appointment</h2>
        <p id="selectedDoctor">
          {doctor.name} - {doctor.specialization}
        </p>

        {error && <div className="form-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="patientName">Patient Name</label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                min="1"
                max="120"
                value={formData.age}
                onChange={handleChange}
                placeholder="Age (1-120)"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
                title="Please enter exactly 10 digits"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="height">Height (cm)</label>
              <input
                type="number"
                id="height"
                name="height"
                min="30"
                max="250"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g. 170"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                min="1"
                max="300"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 68"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bloodPressure">Blood Pressure</label>
            <input
              type="text"
              id="bloodPressure"
              name="bloodPressure"
              value={formData.bloodPressure}
              onChange={handleChange}
              placeholder="e.g. 120/80 mmHg"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Appointment Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Appointment Time</label>
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              >
                <option value="">Select Time</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
              </select>
            </div>
          </div>

          <button type="submit" className="primary-btn full-width" style={{ marginTop: '15px' }}>
            Confirm Appointment
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
