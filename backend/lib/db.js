import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.startsWith("your_")) {
    console.log("MongoDB URI not configured. Running without MongoDB.");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error connecting to MongoDB: `, error.message);
  }
};