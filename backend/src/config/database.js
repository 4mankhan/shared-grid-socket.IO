import mongoose from "mongoose";

export const connectDatabase = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI environment variable is not defined");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);
  console.log("MongoDB connected successfully");
};
