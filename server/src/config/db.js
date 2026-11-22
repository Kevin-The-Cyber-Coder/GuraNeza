import mongoose from 'mongoose';
import env, { isProd } from './env.js';

/**
 * Connects the API to MongoDB.
 * In development the server still starts if MongoDB is unavailable so the
 * frontend can be browsed (API routes return a clear error instead).
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection failed: ${error.message}`);
    if (isProd) process.exit(1);
    return null;
  }
};

export default connectDB;
