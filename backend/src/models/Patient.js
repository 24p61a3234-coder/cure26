import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    age: { type: Number, required: true, min: 0, max: 130 },
    phone: { type: String, trim: true, default: '' },
    tokenNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ['waiting', 'serving', 'completed'],
      default: 'waiting',
      index: true
    },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
    calledAt: Date,
    completedAt: Date
  },
  { timestamps: true }
);

patientSchema.index({ clinic: 1, tokenNumber: 1 }, { unique: true });

export default mongoose.model('Patient', patientSchema);
