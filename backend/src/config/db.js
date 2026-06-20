import mongoose from 'mongoose';

let memoryMode = false;

export async function connectDB() {
  if (process.env.NODE_ENV === 'production' && !process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required in production');
  }
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/queue-cure-26';

  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: process.env.NODE_ENV === 'production' ? 30000 : 2000
    });
    console.log('MongoDB connected');
  } catch (error) {
    if (process.env.NODE_ENV === 'production') throw error;
    memoryMode = true;
    console.warn('MongoDB unavailable. Running Queue Cure 26 with in-memory development storage.');
  }
}

export function isMemoryMode() {
  return memoryMode;
}
