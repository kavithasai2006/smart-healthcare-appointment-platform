import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Hospital from '../models/Hospital.js';
import Location from '../models/Location.js';

// @desc    Book a new appointment in MongoDB
// @route   POST /api/appointments
// @access  Public / Optional Auth
export const createAppointment = async (req, res) => {
  try {
    const {
      location,
      hospital,
      doctor,
      date,
      time,
      patientName,
      patientPhone,
      patientEmail,
      age,
      gender,
      height,
      weight,
      bloodPressure,
      reason,
      specialization,
      fee,
      doctorId,
      hospitalId,
      locationId,
    } = req.body;

    // Validate required fields
    if (!location || !hospital || !doctor || !date || !time || !patientName || !patientPhone) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide all required fields: location, hospital, doctor, date, time, patient name, and phone',
      });
    }

    // Phone format check: 10 digits
    const phoneClean = patientPhone.toString().trim();
    if (!/^\d{10}$/.test(phoneClean)) {
      return res.status(400).json({
        success: false,
        message: 'Patient phone number must be exactly 10 digits',
      });
    }

    // Prevent duplicate booking for same doctor, date, and time in MongoDB
    const hasConflict = await Appointment.findConflict(doctor, date, time);

    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message: `The time slot (${time}) on ${date} for ${doctor} is already booked in MongoDB database. Please choose another slot.`,
      });
    }

    // Associate with logged-in user if available
    const userId = req.user ? req.user._id || req.user.id : req.body.userId || null;

    // Resolve relationships
    const cleanLocName = location.replace(', AP', '').trim();
    let locDoc = null;
    if (locationId && mongoose.Types.ObjectId.isValid(locationId)) {
      locDoc = await Location.findById(locationId);
    }
    if (!locDoc) {
      locDoc = await Location.findOne({ name: { $regex: cleanLocName, $options: 'i' } });
    }

    let hospDoc = null;
    if (hospitalId && mongoose.Types.ObjectId.isValid(hospitalId)) {
      hospDoc = await Hospital.findById(hospitalId);
    }
    if (!hospDoc) {
      hospDoc = await Hospital.findOne({ name: hospital.trim() });
    }

    let docDoc = null;
    if (doctorId && mongoose.Types.ObjectId.isValid(doctorId)) {
      docDoc = await Doctor.findById(doctorId);
    }
    if (!docDoc && mongoose.Types.ObjectId.isValid(doctor.trim())) {
      docDoc = await Doctor.findById(doctor.trim());
    }
    if (!docDoc) {
      docDoc = await Doctor.findOne({ name: doctor.trim() });
    }

    const appointment = await Appointment.create({
      user: userId,
      location: locDoc?._id || null,
      locationName: location.trim(),
      hospital: hospDoc?._id || null,
      hospitalName: hospital.trim(),
      doctor: docDoc?._id || null,
      doctorName: doctor.trim(),
      appointmentDate: date.trim(),
      appointmentTime: time.trim(),
      patientName: patientName.trim(),
      patientPhone: phoneClean,
      patientEmail: (patientEmail || (req.user ? req.user.email : '')).trim().toLowerCase(),
      specialization: specialization || docDoc?.specialization || 'Specialist',
      fee: fee || docDoc?.fee || '₹600',
      age: age ? Number(age) : null,
      gender: gender || '',
      height: height ? Number(height) : null,
      weight: weight ? Number(weight) : null,
      bloodPressure: bloodPressure ? bloodPressure.trim() : '',
      reason: reason ? reason.trim() : 'General Consultation',
      status: 'Confirmed',
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully and confirmed in MongoDB database!',
      data: {
        _id: appointment._id,
        id: appointment._id,
        doctor: appointment.doctorName,
        specialization: appointment.specialization,
        hospital: appointment.hospitalName,
        location: appointment.locationName,
        patientName: appointment.patientName,
        patientPhone: appointment.patientPhone,
        phone: appointment.patientPhone,
        patientEmail: appointment.patientEmail,
        email: appointment.patientEmail,
        date: appointment.appointmentDate,
        appointmentDate: appointment.appointmentDate,
        time: appointment.appointmentTime,
        appointmentTime: appointment.appointmentTime,
        fee: appointment.fee,
        status: appointment.status,
        createdAt: appointment.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `The time slot (${req.body.time}) on ${req.body.date} for ${req.body.doctor} is already booked in MongoDB database. Please choose another slot.`,
      });
    }
    console.error('Error creating appointment in MongoDB:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: error.message,
    });
  }
};

// @desc    Get appointments for the logged-in user from MongoDB
// @route   GET /api/appointments
// @access  Private
export const getUserAppointments = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access appointments',
      });
    }

    const userId = req.user._id || req.user.id;
    const email = req.user.email || '';

    const appointments = await Appointment.find({
      $or: [
        { user: userId },
        { patientEmail: email.toLowerCase().trim() },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Error fetching appointments from MongoDB:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message,
    });
  }
};

// @desc    Get booked time slots for a doctor on a specific date from MongoDB
// @route   GET /api/appointments/booked-slots
// @access  Public
export const getBookedSlots = async (req, res) => {
  try {
    const { doctor, date } = req.query;

    if (!doctor || !date) {
      return res.status(400).json({
        success: false,
        message: 'Doctor and date query parameters are required',
      });
    }

    const bookedSlots = await Appointment.findBookedSlots(doctor, date);

    return res.status(200).json({
      success: true,
      bookedSlots,
    });
  } catch (error) {
    console.error('Error fetching booked slots from MongoDB:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booked slots',
      error: error.message,
    });
  }
};

// @desc    Cancel an appointment in MongoDB
// @route   PATCH /api/appointments/:id/cancel
// @access  Private / User or Admin
export const cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);

    if (!appt) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Role-based security check: Only owner patient or admin can cancel
    if (req.user && req.user.role !== 'admin') {
      const isOwner =
        (appt.user && appt.user.toString() === req.user._id.toString()) ||
        (appt.patientEmail && appt.patientEmail.toLowerCase() === req.user.email.toLowerCase());

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot cancel another patient\'s appointment',
        });
      }
    }

    appt.status = 'Cancelled';
    const updated = await appt.save();

    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully in MongoDB',
      data: updated,
    });
  } catch (error) {
    console.error('Error cancelling appointment in MongoDB:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message,
    });
  }
};
