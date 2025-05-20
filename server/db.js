import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    // Use environment variable or fallback to the connection string
    const MONGODB_URI = process.env.MONGODB_URI ;

    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;