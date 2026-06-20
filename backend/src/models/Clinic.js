import mongoose from 'mongoose';

const clinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    smsProvider: {
      enabled: { type: Boolean, default: false },
      providerName: { type: String, default: 'not-configured' }
    }
  },
  { timestamps: true }
);

export default mongoose.model('Clinic', clinicSchema);
