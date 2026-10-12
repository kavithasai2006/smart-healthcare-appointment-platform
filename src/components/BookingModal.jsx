import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentApi } from '../services/api';

const BookingModal = ({ doctor, isOpen, onClose, onBookingSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Today's date in YYYY-MM-DD for min date constraint
  const todayStr = new Date().toISOString().split('T')[0];

  // Controlled form state
  const [formData, setFormData] = useState({
    patientName: user ? user.fullName : '',
    age: '',
    gender: '',
    email: user ? user.email : '',
    phone: user ? (user.phone || '') : '',
    height: '',
    weight: '',
    bloodPressure: '',
    reason: 'General Consultation',
    date: todayStr,
    time: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedSlotsForDate, setBookedSlotsForDate] = useState([]);

  // Available slots for doctor
  const availableSlots = doctor?.timeSlots || [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
  ];

  // Pre-fill user data when modal opens
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        patientName: user.fullName || prev.patientName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Check already booked slots from backend for this doctor on the selected date
  useEffect(() => {
    if (!doctor || !formData.date) return;

    let isMounted = true;
    const fetchBookedSlots = async () => {
      try {
        const slots = await appointmentApi.getBookedSlots(doctor.name, formData.date);
        if (isMounted) {
          setBookedSlotsForDate(slots || []);
        }
      } catch {
        if (isMounted) {
          setBookedSlotsForDate([]);
        }
      }
    };

    fetchBookedSlots();
    return () => {
      isMounted = false;
    };
  }, [doctor, formData.date]);

  if (!isOpen || !doctor) return null;

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  // Close modal when clicking on the dark backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  // Form submission & validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Extra validation checks
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
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

    if (!formData.date) {
      setError('Please select an appointment date.');
      return;
    }

    if (formData.date < todayStr) {
      setError('Cannot book appointments on past dates.');
      return;
    }

    if (!formData.time) {
      setError('Please select an appointment time slot.');
      return;
    }

    // Check if slot is already in booked list
    if (bookedSlotsForDate.includes(formData.time)) {
      setError(`The slot (${formData.time}) on ${formData.date} is already booked. Please choose another time.`);
      return;
    }

    // Build payload
    const appointmentPayload = {
      doctorId: doctor.id || doctor._id,
      hospitalId: doctor.hospitalId,
      locationId: doctor.locationId,
      doctor: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital || 'Apollo Hospitals',
      location: doctor.location ? `${doctor.location}, AP` : 'Andhra Pradesh',
      fee: doctor.fee || '₹600',
      patientName: formData.patientName.trim(),
      patientPhone: formData.phone.trim(),
      patientEmail: formData.email.trim(),
      age: ageNum,
      gender: formData.gender,
      height: heightNum,
      weight: weightNum,
      bloodPressure: formData.bloodPressure.trim(),
      reason: formData.reason.trim(),
      date: formData.date,
      time: formData.time,
      status: 'Confirmed',
    };

    setIsSubmitting(true);
    try {
      const res = await appointmentApi.createAppointment(appointmentPayload);

      if (res.success) {
        alert(`Appointment confirmed at ${appointmentPayload.hospital}! Stored in database.`);

        if (onBookingSuccess) {
          onBookingSuccess();
        }

        onClose();
        navigate('/appointments');
      } else {
        setError(res.message || 'Failed to book appointment. Please try again.');
      }
    } catch {
      setError('An error occurred while booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal" style={{ display: 'flex' }} onClick={handleBackdropClick}>
      <div className="modal-content">
        <span className="close" onClick={onClose} aria-label="Close modal">
          &times;
        </span>

        <h2>Book Appointment</h2>

        {/* Selected Doctor, Hospital & Location Info Banner */}
        <div className="modal-doctor-summary">
          <div className="modal-doctor-header">
            <div>
              <h3>{doctor.name}</h3>
              <p className="modal-doctor-spec">{doctor.specialization}</p>
            </div>
            <div className="modal-doctor-fee">{doctor.fee || '₹600'}</div>
          </div>
          <div className="modal-hospital-info">
            {doctor.hospital && <span>🏥 <strong>Hospital:</strong> {doctor.hospital}</span>}
            {doctor.location && <span>📍 <strong>Location:</strong> {doctor.location}, Andhra Pradesh</span>}
          </div>
        </div>

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
              placeholder="Enter patient full name"
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

          <div className="form-row">
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

            <div className="form-group">
              <label htmlFor="reason">Consultation Reason</label>
              <input
                type="text"
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="e.g. Health Checkup"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Appointment Date</label>
              <input
                type="date"
                id="date"
                name="date"
                min={todayStr}
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
                <option value="">Select Time Slot</option>
                {availableSlots.map((slot) => {
                  const isBooked = bookedSlotsForDate.includes(slot);
                  return (
                    <option key={slot} value={slot} disabled={isBooked}>
                      {slot} {isBooked ? '(Already Booked)' : '(Available)'}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="primary-btn full-width"
            style={{ marginTop: '15px' }}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Confirming with Database...'
              : `Confirm Appointment at ${doctor.hospital || 'Hospital'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
