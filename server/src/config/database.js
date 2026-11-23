import mongoose from 'mongoose';

export async function connectToDatabase(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error('MONGODB_URI is required. Add your MongoDB Atlas connection string to server/.env.');
  }

  await mongoose.connect(uri);
  console.info(`MongoDB connected (${mongoose.connection.name}).`);
}
