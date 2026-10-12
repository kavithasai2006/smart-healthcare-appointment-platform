import mongoose from 'mongoose';

/**
 * Connect to MongoDB database using Mongoose
 */
export const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_healthcare';

    const conn = await mongoose.connect(mongoUri);

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
