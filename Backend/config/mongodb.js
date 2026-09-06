import mongoose from "mongoose";

const connectDB = async () => {
  // Already connected? Skip reconnecting.
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/anujuserauth`);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export default connectDB;
