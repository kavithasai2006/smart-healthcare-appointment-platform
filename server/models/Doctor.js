import mongoose from 'mongoose';
import './Location.js';
import './Hospital.js';

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
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
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    experience: {
      type: String,
      default: '10 years',
      trim: true,
    },
    fee: {
      type: String,
      default: '₹600',
      trim: true,
    },
    availableDays: {
      type: String,
      default: 'Mon - Sat',
      trim: true,
    },
    timeSlots: {
      type: [String],
      default: [
        '09:00 AM',
        '10:00 AM',
        '11:00 AM',
        '02:00 PM',
        '03:00 PM',
        '04:00 PM',
      ],
    },
    image: {
      type: String,
      default: '👨‍⚕️',
      trim: true,
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

// Helper to escape regex special characters (e.g. parentheses in hospital names)
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Specialization aliases mapping department/field names to practitioner titles & synonyms
export const specializationAliases = {
  cardiology: ['Cardiologist', 'Cardiology'],
  cardiologist: ['Cardiologist', 'Cardiology'],

  dermatology: ['Dermatologist', 'Dermatology'],
  dermatologist: ['Dermatologist', 'Dermatology'],

  pediatrics: ['Pediatrician', 'Pediatrics'],
  pediatrician: ['Pediatrician', 'Pediatrics'],
  pediatric: ['Pediatrician', 'Pediatrics'],

  orthopedics: ['Orthopedic', 'Orthopedics', 'Orthopedic Surgeon'],
  orthopedic: ['Orthopedic', 'Orthopedics', 'Orthopedic Surgeon'],

  neurology: ['Neurologist', 'Neurology'],
  neurologist: ['Neurologist', 'Neurology'],

  gynecology: ['Gynecologist', 'Gynecology', 'Obstetrics & Gynecology'],
  gynecologist: ['Gynecologist', 'Gynecology', 'Obstetrics & Gynecology'],

  pulmonology: ['Pulmonologist', 'Pulmonology'],
  pulmonologist: ['Pulmonologist', 'Pulmonology'],

  ent: ['ENT Specialist', 'ENT', 'Otolaryngologist'],
  'ent specialist': ['ENT Specialist', 'ENT', 'Otolaryngologist'],

  ophthalmology: ['Ophthalmologist', 'Ophthalmology', 'Eye Specialist'],
  ophthalmologist: ['Ophthalmologist', 'Ophthalmology', 'Eye Specialist'],
  'eye specialist': ['Ophthalmologist', 'Ophthalmology', 'Eye Specialist'],

  dentistry: ['Dentist', 'Dentistry', 'Dental Surgeon'],
  dentist: ['Dentist', 'Dentistry', 'Dental Surgeon'],

  'general medicine': ['General Physician', 'General Medicine', 'General Health'],
  'general physician': ['General Physician', 'General Medicine', 'General Health'],
  'general health': ['General Physician', 'General Medicine', 'General Health'],

  oncology: ['Oncologist', 'Oncology'],
  oncologist: ['Oncologist', 'Oncology'],

  nephrology: ['Nephrologist', 'Nephrology'],
  nephrologist: ['Nephrologist', 'Nephrology'],

  'cardiac surgery': ['Cardiac Surgeon', 'Cardiac Surgery'],
  'cardiac surgeon': ['Cardiac Surgeon', 'Cardiac Surgery'],

  'general surgery': ['General Surgeon', 'General Surgery', 'Surgery'],
  surgery: ['General Surgeon', 'General Surgery', 'Surgery'],
  'general surgeon': ['General Surgeon', 'General Surgery', 'Surgery'],

  'critical care': ['Critical Care Specialist', 'Critical Care'],
  emergency: ['Emergency Medicine Specialist', 'Emergency Medicine', 'Emergency'],
  neonatology: ['Neonatologist', 'Neonatology'],
  trauma: ['Trauma Specialist', 'Trauma'],
  vascular: ['Vascular Surgeon', 'Vascular'],
};

// Build robust regex matching specialization, its aliases and root stems
export const getSpecializationRegex = (spec) => {
  const clean = spec.trim().toLowerCase();
  const aliases = specializationAliases[clean];
  if (aliases && aliases.length > 0) {
    return new RegExp('^(' + aliases.map(escapeRegex).join('|') + ')$', 'i');
  }
  const stem = clean.replace(/(logist|logy|ician|ics|ist|ic|s)$/i, '');
  if (stem.length >= 4) {
    return new RegExp('^(' + escapeRegex(clean) + '|' + escapeRegex(stem) + '.*)$', 'i');
  }
  return new RegExp(escapeRegex(clean), 'i');
};

// Compatibility static helper for filtered search
doctorSchema.statics.findAll = async function ({
  location = '',
  hospital = '',
  specialization = '',
  search = '',
} = {}) {
  const andConditions = [];

  if (location && location.trim()) {
    const locTrim = location.trim();
    if (mongoose.Types.ObjectId.isValid(locTrim)) {
      andConditions.push({
        $or: [
          { location: new mongoose.Types.ObjectId(locTrim) },
          { locationName: locTrim },
        ],
      });
    } else {
      const cleanLoc = locTrim.replace(', AP', '').trim();
      const LocationModel = mongoose.model('Location');
      const locDocs = await LocationModel.find({
        name: { $regex: escapeRegex(cleanLoc), $options: 'i' },
      }).select('_id');
      const orLoc = [
        { locationName: { $regex: escapeRegex(cleanLoc), $options: 'i' } },
      ];
      if (locDocs && locDocs.length > 0) {
        orLoc.unshift({ location: { $in: locDocs.map((l) => l._id) } });
      }
      andConditions.push({ $or: orLoc });
    }
  }

  if (hospital && hospital.trim()) {
    const hospTrim = hospital.trim();
    if (mongoose.Types.ObjectId.isValid(hospTrim)) {
      andConditions.push({
        $or: [
          { hospital: new mongoose.Types.ObjectId(hospTrim) },
          { hospitalName: hospTrim },
        ],
      });
    } else {
      const HospitalModel = mongoose.model('Hospital');
      let normalizedHospPattern = escapeRegex(hospTrim);
      if (/chinaka[kl]ani/i.test(hospTrim)) {
        normalizedHospPattern = normalizedHospPattern.replace(/chinaka[kl]ani/gi, 'chinaka[kl]ani');
      }
      const hospDocs = await HospitalModel.find({
        name: { $regex: normalizedHospPattern, $options: 'i' },
      }).select('_id');
      const orHosp = [
        { hospitalName: { $regex: normalizedHospPattern, $options: 'i' } },
      ];
      if (hospDocs && hospDocs.length > 0) {
        orHosp.unshift({ hospital: { $in: hospDocs.map((h) => h._id) } });
      }
      andConditions.push({ $or: orHosp });
    }
  }

  if (specialization && specialization.trim()) {
    const specRegex = getSpecializationRegex(specialization.trim());
    andConditions.push({
      specialization: { $regex: specRegex },
    });
  }

  if (search && search.trim()) {
    const s = escapeRegex(search.trim());
    andConditions.push({
      $or: [
        { name: { $regex: s, $options: 'i' } },
        { specialization: { $regex: s, $options: 'i' } },
        { hospitalName: { $regex: s, $options: 'i' } },
        { locationName: { $regex: s, $options: 'i' } },
      ],
    });
  }

  const query = andConditions.length > 0 ? { $and: andConditions } : {};

  const docs = await this.find(query)
    .populate('location', 'name state')
    .populate('hospital', 'name city address isSample')
    .sort({ rating: -1 });

  return docs.map((doc) => ({
    _id: doc._id,
    id: doc._id,
    name: doc.name,
    specialization: doc.specialization,
    location: doc.locationName,
    locationId: doc.location?._id || doc.location,
    hospital: doc.hospitalName,
    hospitalId: doc.hospital?._id || doc.hospital,
    isSample: doc.hospital?.isSample || doc.hospitalName?.startsWith('[Sample]') || false,
    rating: doc.rating,
    experience: doc.experience,
    fee: doc.fee,
    availableDays: doc.availableDays,
    timeSlots: doc.timeSlots,
    image: doc.image,
    createdAt: doc.createdAt,
  }));
};

// Static helper to get available specializations (optionally filtered by location and/or hospital)
doctorSchema.statics.getSpecializations = async function ({ location = '', hospital = '' } = {}) {
  const andConditions = [];

  if (location && location.trim()) {
    const locTrim = location.trim();
    if (mongoose.Types.ObjectId.isValid(locTrim)) {
      andConditions.push({
        $or: [
          { location: new mongoose.Types.ObjectId(locTrim) },
          { locationName: { $regex: escapeRegex(locTrim), $options: 'i' } },
        ],
      });
    } else {
      const cleanLoc = locTrim.replace(', AP', '').trim();
      const LocationModel = mongoose.model('Location');
      const locDocs = await LocationModel.find({
        name: { $regex: escapeRegex(cleanLoc), $options: 'i' },
      }).select('_id');
      const orLoc = [
        { locationName: { $regex: escapeRegex(cleanLoc), $options: 'i' } },
      ];
      if (locDocs && locDocs.length > 0) {
        orLoc.unshift({ location: { $in: locDocs.map((l) => l._id) } });
      }
      andConditions.push({ $or: orLoc });
    }
  }

  if (hospital && hospital.trim()) {
    const hospTrim = hospital.trim();
    if (mongoose.Types.ObjectId.isValid(hospTrim)) {
      andConditions.push({
        $or: [
          { hospital: new mongoose.Types.ObjectId(hospTrim) },
          { hospitalName: { $regex: escapeRegex(hospTrim), $options: 'i' } },
        ],
      });
    } else {
      const HospitalModel = mongoose.model('Hospital');
      let normalizedHospPattern = escapeRegex(hospTrim);
      if (/chinaka[kl]ani/i.test(hospTrim)) {
        normalizedHospPattern = normalizedHospPattern.replace(/chinaka[kl]ani/gi, 'chinaka[kl]ani');
      }
      const hospDocs = await HospitalModel.find({
        name: { $regex: normalizedHospPattern, $options: 'i' },
      }).select('_id');
      const orHosp = [
        { hospitalName: { $regex: normalizedHospPattern, $options: 'i' } },
      ];
      if (hospDocs && hospDocs.length > 0) {
        orHosp.unshift({ hospital: { $in: hospDocs.map((h) => h._id) } });
      }
      andConditions.push({ $or: orHosp });
    }
  }

  const query = andConditions.length > 0 ? { $and: andConditions } : {};
  const specs = await this.distinct('specialization', query);

  return specs.filter(Boolean).sort();
};

const Doctor = mongoose.model('Doctor', doctorSchema);

export { Doctor };
export default Doctor;
