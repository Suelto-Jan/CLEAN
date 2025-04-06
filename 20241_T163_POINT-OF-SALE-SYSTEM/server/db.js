import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      'mongodb+srv://2201102887:test123@cluster0.f3a4r.mongodb.net/PointofSale?retryWrites=true&w=majority&appName=Cluster0',
      {
        serverSelectionTimeoutMS: 30000,
      }
    );
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;