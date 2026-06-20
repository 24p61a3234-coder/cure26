import mongoose from 'mongoose';

const clinicSettingsSchema = new mongoose.Schema(
  {
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true, unique: true },
    avgConsultationTime: { type: Number, default: 10, min: 1, max: 240 },
    currentToken: { type: Number, default: 0 },
    lastTokenNumber: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('ClinicSettings', clinicSettingsSchema);
