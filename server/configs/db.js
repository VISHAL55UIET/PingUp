import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Mongo URI is missing in ENV");
    }
    console.log("Mongo URI loaded:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo connected successfully");
  } catch (err) {
    console.log("Mongo connection failed:", err);
    process.exit(1);
  }
};

export default connectDB;