import Location from '../models/Location.js';

// @desc    Get all Andhra Pradesh locations from MongoDB
// @route   GET /api/locations
// @access  Public
export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true }).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    console.error('Error fetching locations from MongoDB:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch locations',
      error: error.message,
    });
  }
};

// @desc    Create a location in MongoDB
// @route   POST /api/locations
// @access  Private / Admin
export const createLocation = async (req, res) => {
  try {
    const { name, state, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Location name is required' });
    }

    const existing = await Location.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Location already exists' });
    }

    const location = await Location.create({
      name: name.trim(),
      state: state || 'Andhra Pradesh',
      description: description || '',
      isActive: true,
    });

    return res.status(201).json({ success: true, data: location });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
