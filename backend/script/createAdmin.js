import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/UserSchema.js";

dotenv.config({ path: "../.env" });

const createAdmin = async () => {
  try {
    // Connect DB
    await mongoose.connect(process.env.MONGO_URI);
    console.info("MongoDB Connected");

    const email = "admin@gmail.com";
    const password = "Admin@123";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.info("Admin already exists");
      process.exit();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email,
      password: hashedPassword,
      role: "admin",
    });

    process.exit();
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();