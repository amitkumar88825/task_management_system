import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import User from "../models/UserSchema.js";

dotenv.config({ path: "../.env" });

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Optional: remove old users
    await User.deleteMany({ role: "user" });
    console.log("Old users removed");

    const users = [];

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    // Create 150 users
    for (let i = 0; i < 150; i++) {
      users.push({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: hashedPassword,
        role: "user",
        avatar: faker.image.avatar(),

        isActive: faker.datatype.boolean({ probability: 0.9 }),

        lastLogin: faker.date.recent({ days: 30 }),
      });
    }

    await User.insertMany(users);

    console.log(`${users.length} users created`);
    process.exit();
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();