// ============================================================
// backend/config/db.js  — MongoDB / Mongoose Connection
// ============================================================
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 7+ no longer requires these options, but kept for clarity
    });

    console.log(`✅  MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events after initial connect
    mongoose.connection.on('error', (err) => {
      console.error(`❌  MongoDB runtime error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️   MongoDB disconnected. Attempting to reconnect…');
    });

  } catch (error) {
    console.error(`❌  MongoDB connection failed: ${error.message}`);
    process.exit(1); // Crash fast — let process manager (PM2) restart
  }
};

export default connectDB;
