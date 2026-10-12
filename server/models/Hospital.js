import mongoose from 'mongoose';
import './Location.js';

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    locationName: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    specialties: {
      type: [String],
      default: [],
    },
    isSample: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helper to escape regex special characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Compatibility static helpers
hospitalSchema.statics.findAll = async function (location = '') {
  let query = {};
  if (location && location.trim()) {
    const locTrim = location.trim();
    if (mongoose.Types.ObjectId.isValid(locTrim)) {
      query.$or = [
        { location: new mongoose.Types.ObjectId(locTrim) },
        { locationName: locTrim },
      ];
    } else {
      const cleanLoc = locTrim.replace(', AP', '').trim();
      const LocationModel = mongoose.model('Location');
      const locDoc = await LocationModel.findOne({
        name: { $regex: `^${escapeRegex(cleanLoc)}$`, $options: 'i' },
      });

      const orConditions = [
        { locationName: { $regex: escapeRegex(cleanLoc), $options: 'i' } },
        { city: { $regex: escapeRegex(cleanLoc), $options: 'i' } },
      ];

      if (locDoc) {
        orConditions.unshift({ location: locDoc._id });
      }

      query.$or = orConditions;
    }
  }
  return await this.find(query).populate('location', 'name state').sort({ name: 1 });
};

const Hospital = mongoose.model('Hospital', hospitalSchema);

export { Hospital };
export default Hospital;
