import dotenv from 'dotenv';
import { connectDB, isMemoryMode } from '../config/db.js';
import Clinic from '../models/Clinic.js';
import ClinicSettings from '../models/ClinicSettings.js';
import User from '../models/User.js';

dotenv.config();

export async function seedDefaultClinicAndUser() {
  if (isMemoryMode()) return;

  const clinic = await Clinic.findOneAndUpdate(
    { slug: 'main-clinic' },
    { name: 'Queue Cure Main Clinic', slug: 'main-clinic' },
    { upsert: true, new: true }
  );

  await ClinicSettings.findOneAndUpdate(
    { clinic: clinic._id },
    { $setOnInsert: { clinic: clinic._id, avgConsultationTime: 10, currentToken: 0, lastTokenNumber: 0 } },
    { upsert: true, new: true }
  );

  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@queuecure.local';
  const exists = await User.findOne({ email });
  if (!exists) {
    await User.create({
      name: process.env.DEFAULT_ADMIN_NAME || 'Receptionist',
      email,
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!',
      role: 'admin',
      clinic: clinic._id
    });
    console.log(`Default admin created: ${email}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  connectDB()
    .then(seedDefaultClinicAndUser)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
