import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      unique: true,
      trim: true,
    },
    state: {
      type: String,
      default: 'Andhra Pradesh',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
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

// Compatibility static helpers
locationSchema.statics.findAll = async function () {
  return await this.find({ isActive: true }).sort({ name: 1 });
};

locationSchema.statics.findByName = async function (name) {
  return await this.findOne({ name: name.trim() });
};

const Location = mongoose.model('Location', locationSchema);

export { Location };
export default Location;
