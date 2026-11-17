import mongoose from 'mongoose';

/**
 * Connects the API to MongoDB.
 * In development the server still starts if MongoDB is unavailable so the
 * frontend can be browsed (API routes will return a clear error instead).
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/guraneza';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection failed: ${error.message}`);
    if (process.env.NODE_ENV === 'production') process.exit(1);
    return null;
  }
};

export default connectDB;
