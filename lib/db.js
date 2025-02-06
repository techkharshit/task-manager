import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Database connection failed');
  }
};

export default connectDB;