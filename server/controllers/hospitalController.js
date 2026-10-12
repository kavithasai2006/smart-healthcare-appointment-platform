import Hospital from '../models/Hospital.js';
import Location from '../models/Location.js';

// @desc    Get hospitals, optionally filtered by AP location from MongoDB
// @route   GET /api/hospitals
// @access  Public
export const getHospitals = async (req, res) => {
  try {
    const { location } = req.query;
    const hospitals = await Hospital.findAll(location || '');
    return res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    console.error('Error fetching hospitals from MongoDB:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch hospitals',
      error: error.message,
    });
  }
};

// @desc    Create a hospital in MongoDB
// @route   POST /api/hospitals
// @access  Private / Admin
export const createHospital = async (req, res) => {
  try {
    const { name, location, address, phone, rating, specialties } = req.body;
    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: 'Hospital name and location are required',
      });
    }

    // Resolve location object
    let locationDoc = null;
    if (typeof location === 'string') {
      locationDoc = await Location.findOne({ name: location.trim() });
    } else if (location._id) {
      locationDoc = await Location.findById(location._id);
    }

    const hospital = await Hospital.create({
      name: name.trim(),
      location: locationDoc ? locationDoc._id : null,
      locationName: locationDoc ? locationDoc.name : String(location).trim(),
      city: locationDoc ? locationDoc.name : '',
      address: address || '',
      phone: phone || '',
      rating: rating || 4.8,
      specialties: specialties || [],
    });

    return res.status(201).json({ success: true, data: hospital });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
