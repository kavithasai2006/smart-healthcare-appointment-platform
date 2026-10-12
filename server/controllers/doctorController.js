import Doctor from '../models/Doctor.js';
import Location from '../models/Location.js';
import Hospital from '../models/Hospital.js';

// @desc    Get doctors with AP location, hospital, specialization, and search filters
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req, res) => {
  try {
    const { location, hospital, specialization, search } = req.query;
    const doctors = await Doctor.findAll({
      location: location || '',
      hospital: hospital || '',
      specialization: specialization || '',
      search: search || '',
    });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    console.error('Error fetching doctors from MongoDB:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: error.message,
    });
  }
};

// @desc    Get distinct doctor specializations (optionally filtered by location and/or hospital)
// @route   GET /api/doctors/specializations
// @access  Public
export const getSpecializations = async (req, res) => {
  try {
    const { location, hospital } = req.query;
    const specializations = await Doctor.getSpecializations({
      location: location || '',
      hospital: hospital || '',
    });

    return res.status(200).json({
      success: true,
      count: specializations.length,
      data: specializations,
    });
  } catch (error) {
    console.error('Error fetching specializations from MongoDB:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch specializations',
      error: error.message,
    });
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('location', 'name state')
      .populate('hospital', 'name city address');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: doctor._id,
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        location: doctor.locationName,
        locationId: doctor.location?._id || doctor.location,
        hospital: doctor.hospitalName,
        hospitalId: doctor.hospital?._id || doctor.hospital,
        rating: doctor.rating,
        experience: doctor.experience,
        fee: doctor.fee,
        availableDays: doctor.availableDays,
        timeSlots: doctor.timeSlots,
        image: doctor.image,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a doctor profile in MongoDB
// @route   POST /api/doctors
// @access  Private / Admin
export const createDoctor = async (req, res) => {
  try {
    const {
      name,
      specialization,
      location,
      hospital,
      rating,
      experience,
      fee,
      availableDays,
      timeSlots,
      image,
    } = req.body;

    if (!name || !specialization || !location || !hospital) {
      return res.status(400).json({
        success: false,
        message: 'Name, specialization, location, and hospital are required',
      });
    }

    // Resolve location and hospital references
    const locDoc = await Location.findOne({ name: location.trim() });
    const hospDoc = await Hospital.findOne({ name: hospital.trim() });

    const doctor = await Doctor.create({
      name: name.trim(),
      specialization: specialization.trim(),
      location: locDoc ? locDoc._id : null,
      locationName: locDoc ? locDoc.name : location.trim(),
      hospital: hospDoc ? hospDoc._id : null,
      hospitalName: hospDoc ? hospDoc.name : hospital.trim(),
      rating: rating || 4.8,
      experience: experience || '10 years',
      fee: fee || '₹600',
      availableDays: availableDays || 'Mon - Sat',
      timeSlots: timeSlots || [],
      image: image || '👨‍⚕️',
    });

    return res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
