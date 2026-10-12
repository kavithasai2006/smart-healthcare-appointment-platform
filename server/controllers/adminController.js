import mongoose from 'mongoose';
import Hospital from '../models/Hospital.js';
import Doctor from '../models/Doctor.js';
import Location from '../models/Location.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

// Standard supported Andhra Pradesh locations
const VALID_AP_LOCATIONS = [
  'Guntur', 'Vijayawada', 'Tenali', 'Visakhapatnam', 'Tirupati',
  'Nellore', 'Kakinada', 'Rajahmundry', 'Ongole', 'Kurnool',
  'Kadapa', 'Anantapur', 'Eluru'
];

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private / Admin
export const getAdminStats = async (req, res) => {
  try {
    const [hospitalsCount, doctorsCount, locationsCount, appointmentsCount, usersCount] = await Promise.all([
      Hospital.countDocuments(),
      Doctor.countDocuments(),
      Location.countDocuments(),
      Appointment.countDocuments(),
      User.countDocuments(),
    ]);

    const activeAppointments = await Appointment.countDocuments({ status: { $in: ['Confirmed', 'Pending'] } });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'Cancelled' });
    const completedAppointments = await Appointment.countDocuments({ status: 'Completed' });

    return res.status(200).json({
      success: true,
      stats: {
        totalHospitals: hospitalsCount,
        totalDoctors: doctorsCount,
        totalLocations: locationsCount,
        totalAppointments: appointmentsCount,
        totalUsers: usersCount,
        hospitals: hospitalsCount,
        doctors: doctorsCount,
        locations: locationsCount,
        appointments: appointmentsCount,
        users: usersCount,
        activeAppointments,
        cancelledAppointments,
        completedAppointments,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all hospitals for admin with doctor counts
// @route   GET /api/admin/hospitals
// @access  Private / Admin
export const getAdminHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({})
      .populate('location', 'name state')
      .sort({ createdAt: -1 });

    const results = await Promise.all(
      hospitals.map(async (h) => {
        const doctorCount = await Doctor.countDocuments({ hospital: h._id });
        return {
          _id: h._id,
          id: h._id,
          name: h.name,
          location: h.location,
          locationName: h.locationName,
          city: h.city,
          address: h.address,
          phone: h.phone,
          rating: h.rating,
          specialties: h.specialties,
          isSample: h.isSample,
          isActive: h.isActive !== false,
          doctorCount,
          createdAt: h.createdAt,
        };
      })
    );

    return res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new hospital
// @route   POST /api/admin/hospitals
// @access  Private / Admin
export const createHospital = async (req, res) => {
  try {
    const { name, locationName, address, phone, rating, specialties } = req.body;

    if (!name || !locationName) {
      return res.status(400).json({ success: false, message: 'Hospital name and location are required' });
    }

    const cleanLoc = locationName.trim();
    const locDoc = await Location.findOne({ name: cleanLoc });

    if (!locDoc) {
      return res.status(400).json({
        success: false,
        message: `Location '${cleanLoc}' is not a recognized Andhra Pradesh location. Supported locations: ${VALID_AP_LOCATIONS.join(', ')}`,
      });
    }

    const existingHosp = await Hospital.findOne({ name: name.trim() });
    if (existingHosp) {
      return res.status(400).json({ success: false, message: `A hospital with name '${name}' already exists` });
    }

    const hospital = await Hospital.create({
      name: name.trim(),
      location: locDoc._id,
      locationName: locDoc.name,
      city: locDoc.name,
      address: address ? address.trim() : '',
      phone: phone ? phone.trim() : '',
      rating: rating ? Number(rating) : 4.8,
      specialties: Array.isArray(specialties) ? specialties : (specialties ? specialties.split(',').map((s) => s.trim()) : []),
      isSample: false,
      isActive: true,
    });

    return res.status(201).json({ success: true, message: 'Hospital created successfully', data: hospital, hospital });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing hospital
// @route   PUT /api/admin/hospitals/:id
// @access  Private / Admin
export const updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, rating, specialties, isActive } = req.body;

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    if (name) hospital.name = name.trim();
    if (address !== undefined) hospital.address = address.trim();
    if (phone !== undefined) hospital.phone = phone.trim();
    if (rating !== undefined) hospital.rating = Number(rating);
    if (specialties !== undefined) {
      hospital.specialties = Array.isArray(specialties)
        ? specialties
        : specialties.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (isActive !== undefined) hospital.isActive = Boolean(isActive);

    const updated = await hospital.save();

    // If name changed, synchronize doctor records
    if (name) {
      await Doctor.updateMany({ hospital: hospital._id }, { hospitalName: hospital.name });
    }

    return res.status(200).json({ success: true, message: 'Hospital updated successfully', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle hospital active status
// @route   PATCH /api/admin/hospitals/:id/toggle-active
// @access  Private / Admin
export const toggleHospitalActive = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    hospital.isActive = !(hospital.isActive !== false);
    await hospital.save();

    return res.status(200).json({
      success: true,
      message: `Hospital '${hospital.name}' is now ${hospital.isActive ? 'active' : 'deactivated'}`,
      data: hospital,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all doctors for admin
// @route   GET /api/admin/doctors
// @access  Private / Admin
export const getAdminDoctors = async (req, res) => {
  try {
    const { hospital, specialization, location, search } = req.query;
    const filter = {};

    if (hospital) filter.hospital = hospital;
    if (specialization) filter.specialization = specialization;
    if (location) filter.location = location;
    if (search) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { specialization: { $regex: search.trim(), $options: 'i' } },
        { hospitalName: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const doctors = await Doctor.find(filter)
      .populate('hospital', 'name city')
      .populate('location', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new doctor
// @route   POST /api/admin/doctors
// @access  Private / Admin
export const createDoctor = async (req, res) => {
  try {
    const { name, specialization, hospitalId, experience, fee, availableDays, timeSlots } = req.body;

    if (!name || !specialization || !hospitalId) {
      return res.status(400).json({ success: false, message: 'Name, specialization, and hospital are required' });
    }

    const hospDoc = await Hospital.findById(hospitalId);
    if (!hospDoc) {
      return res.status(404).json({ success: false, message: 'Specified hospital was not found' });
    }

    const locDoc = await Location.findById(hospDoc.location);

    const doctor = await Doctor.create({
      name: name.trim(),
      specialization: specialization.trim(),
      hospital: hospDoc._id,
      hospitalName: hospDoc.name,
      location: locDoc ? locDoc._id : hospDoc.location,
      locationName: locDoc ? locDoc.name : hospDoc.locationName,
      experience: experience ? experience.trim() : '10 years',
      fee: fee ? fee.trim() : '₹600',
      availableDays: availableDays ? availableDays.trim() : 'Mon - Sat',
      timeSlots: Array.isArray(timeSlots) && timeSlots.length > 0 ? timeSlots : ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
      isSample: false,
      isActive: true,
    });

    // Synchronize hospital specialties
    if (!hospDoc.specialties.includes(doctor.specialization)) {
      hospDoc.specialties.push(doctor.specialization);
      await hospDoc.save();
    }

    return res.status(201).json({ success: true, message: 'Doctor registered successfully', data: doctor, doctor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing doctor
// @route   PUT /api/admin/doctors/:id
// @access  Private / Admin
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialization, experience, fee, availableDays, timeSlots, isActive } = req.body;

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (name) doctor.name = name.trim();
    if (specialization) doctor.specialization = specialization.trim();
    if (experience !== undefined) doctor.experience = experience.trim();
    if (fee !== undefined) doctor.fee = fee.trim();
    if (availableDays !== undefined) doctor.availableDays = availableDays.trim();
    if (timeSlots !== undefined && Array.isArray(timeSlots)) doctor.timeSlots = timeSlots;
    if (isActive !== undefined) doctor.isActive = Boolean(isActive);

    const updated = await doctor.save();
    return res.status(200).json({ success: true, message: 'Doctor details updated successfully', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle doctor active status without deleting history
// @route   PATCH /api/admin/doctors/:id/toggle-active
// @access  Private / Admin
export const toggleDoctorActive = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    doctor.isActive = !(doctor.isActive !== false);
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: `Doctor '${doctor.name}' is now ${doctor.isActive ? 'active' : 'deactivated'}`,
      data: doctor,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all locations for admin
// @route   GET /api/admin/locations
// @access  Private / Admin
export const getAdminLocations = async (req, res) => {
  try {
    const locations = await Location.find({}).sort({ name: 1 });
    const results = await Promise.all(
      locations.map(async (l) => {
        const hospitalCount = await Hospital.countDocuments({ location: l._id });
        const doctorCount = await Doctor.countDocuments({ location: l._id });
        return {
          _id: l._id,
          id: l._id,
          name: l.name,
          state: l.state,
          hospitalCount,
          doctorCount,
        };
      })
    );
    return res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new location (Andhra Pradesh strictly enforced)
// @route   POST /api/admin/locations
// @access  Private / Admin
export const createLocation = async (req, res) => {
  try {
    const { name, state } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Location name is required' });
    }

    const nameClean = name.trim();
    const isKnownAp = VALID_AP_LOCATIONS.some(
      (l) => l.toLowerCase() === nameClean.toLowerCase()
    );

    if (!isKnownAp) {
      return res.status(400).json({
        success: false,
        message: `Location '${nameClean}' is not a recognized Andhra Pradesh location. Supported locations: ${VALID_AP_LOCATIONS.join(', ')}`,
      });
    }

    const stateNorm = (state || 'Andhra Pradesh').trim();
    if (stateNorm.toLowerCase() !== 'andhra pradesh') {
      return res.status(400).json({
        success: false,
        message: 'Platform policy strictly supports Andhra Pradesh locations only.',
      });
    }

    const existing = await Location.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Location '${name}' already exists in Andhra Pradesh.` });
    }

    const location = await Location.create({
      name: name.trim(),
      state: 'Andhra Pradesh',
      isActive: true,
    });

    return res.status(201).json({ success: true, message: 'Location registered successfully', data: location });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all appointments for admin with search & filters
// @route   GET /api/admin/appointments
// @access  Private / Admin
export const getAdminAppointments = async (req, res) => {
  try {
    const { status, hospital, doctor, location, search, date } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (hospital) filter.hospitalName = { $regex: hospital.trim(), $options: 'i' };
    if (doctor) filter.doctorName = { $regex: doctor.trim(), $options: 'i' };
    if (location) filter.locationName = { $regex: location.trim(), $options: 'i' };
    if (date) filter.appointmentDate = date.trim();
    if (search) {
      filter.$or = [
        { patientName: { $regex: search.trim(), $options: 'i' } },
        { patientEmail: { $regex: search.trim(), $options: 'i' } },
        { patientPhone: { $regex: search.trim(), $options: 'i' } },
        { doctorName: { $regex: search.trim(), $options: 'i' } },
        { hospitalName: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const appointments = await Appointment.find(filter)
      .populate('user', 'fullName email')
      .populate('doctor', 'name specialization')
      .populate('hospital', 'name')
      .populate('location', 'name')
      .sort({ appointmentDate: -1, createdAt: -1 });

    return res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status
// @route   PATCH /api/admin/appointments/:id/status
// @access  Private / Admin
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status;
    const updated = await appointment.save();

    return res.status(200).json({
      success: true,
      message: `Appointment status updated to '${status}' successfully`,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
