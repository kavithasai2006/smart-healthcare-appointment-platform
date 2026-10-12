import mongoose from 'mongoose';
import './User.js';
import './Location.js';
import './Hospital.js';
import './Doctor.js';

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null,
    },
    locationName: {
      type: String,
      default: '',
      trim: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
    },
    hospitalName: {
      type: String,
      default: '',
      trim: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
    },
    doctorName: {
      type: String,
      default: '',
      trim: true,
    },
    appointmentDate: {
      type: String,
      required: [true, 'Appointment date is required'],
      trim: true,
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time is required'],
      trim: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientPhone: {
      type: String,
      required: [true, 'Patient phone is required'],
      trim: true,
    },
    patientEmail: {
      type: String,
      default: '',
      trim: true,
    },
    reason: {
      type: String,
      default: 'General Consultation',
      trim: true,
    },
    specialization: {
      type: String,
      default: 'Specialist',
      trim: true,
    },
    fee: {
      type: String,
      default: '₹600',
      trim: true,
    },
    age: {
      type: Number,
      default: null,
    },
    gender: {
      type: String,
      default: '',
    },
    height: {
      type: Number,
      default: null,
    },
    weight: {
      type: Number,
      default: null,
    },
    bloodPressure: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Confirmed',
    },
  },
  {
    timestamps: true,
  }
);

// Concurrency Protection: Compound partial unique index for active slots
// Guarantees at database-level that two concurrent requests cannot book the same slot
// Excludes cancelled bookings so previously cancelled slots can be re-booked immediately
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, appointmentTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['Confirmed', 'Pending'] } },
    name: 'unique_active_doctor_slot',
  }
);

// Virtuals to support both naming styles
appointmentSchema.virtual('date').get(function () {
  return this.appointmentDate;
});

appointmentSchema.virtual('time').get(function () {
  return this.appointmentTime;
});

// Statics for conflict checking and booked slots
appointmentSchema.statics.findConflict = async function (doctor, date, time) {
  const query = {
    appointmentDate: date.trim(),
    appointmentTime: time.trim(),
    status: { $ne: 'Cancelled' },
  };

  if (mongoose.Types.ObjectId.isValid(doctor)) {
    query.$or = [{ doctor }, { doctorName: doctor.trim() }];
  } else {
    query.doctorName = doctor.trim();
  }

  const existing = await this.findOne(query);
  return !!existing;
};

appointmentSchema.statics.findBookedSlots = async function (doctor, date) {
  const query = {
    appointmentDate: date.trim(),
    status: { $ne: 'Cancelled' },
  };

  if (mongoose.Types.ObjectId.isValid(doctor)) {
    query.$or = [{ doctor }, { doctorName: doctor.trim() }];
  } else {
    query.doctorName = doctor.trim();
  }

  const appointments = await this.find(query).select('appointmentTime');
  return appointments.map((apt) => apt.appointmentTime);
};

// Find appointments by user id or email
appointmentSchema.statics.findByUser = async function (userId, email = '') {
  const conditions = [];

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    conditions.push({ user: userId });
  }

  if (email && email.trim()) {
    conditions.push({ patientEmail: email.toLowerCase().trim() });
  }

  const query = conditions.length > 0 ? { $or: conditions } : {};

  const appointments = await this.find(query)
    .populate('user', 'fullName email')
    .populate('location', 'name state')
    .populate('hospital', 'name city address')
    .populate('doctor', 'name specialization')
    .sort({ createdAt: -1 });

  return appointments.map((apt) => ({
    _id: apt._id,
    id: apt._id,
    doctor: apt.doctorName || apt.doctor?.name,
    specialization: apt.specialization || apt.doctor?.specialization,
    hospital: apt.hospitalName || apt.hospital?.name,
    location: apt.locationName || apt.location?.name,
    fee: apt.fee,
    patientName: apt.patientName,
    patientPhone: apt.patientPhone,
    phone: apt.patientPhone,
    patientEmail: apt.patientEmail,
    email: apt.patientEmail,
    age: apt.age,
    gender: apt.gender,
    height: apt.height,
    weight: apt.weight,
    bloodPressure: apt.bloodPressure,
    reason: apt.reason,
    appointmentDate: apt.appointmentDate,
    date: apt.appointmentDate,
    appointmentTime: apt.appointmentTime,
    time: apt.appointmentTime,
    status: apt.status,
    createdAt: apt.createdAt,
  }));
};

appointmentSchema.statics.cancel = async function (id) {
  return await this.findByIdAndUpdate(
    id,
    { status: 'Cancelled' },
    { returnDocument: 'after' }
  );
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

export { Appointment };
export default Appointment;
