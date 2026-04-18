import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/UserSchema.js";
import Task from "../models/TaskSchema.js";

dotenv.config({ path: "../.env" });

const seedTasks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const users = await User.find({
      role: "user",
      isActive: true,
    });

    if (users.length === 0) {
      process.exit();
    }


    // 2. Delete all existing tasks
    await Task.deleteMany({});

    const statuses = ["pending", "in-progress", "completed"];
    const priorities = ["low", "medium", "high"];

    const tasks = [];

    // 3. Generate tasks for last 30 days
    for (let day = 0; day < 30; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);

      for (const user of users) {
        // Each user gets 2–4 tasks per day
        const taskCount = Math.floor(Math.random() * 3) + 2;

        for (let i = 0; i < taskCount; i++) {
          const status =
            statuses[Math.floor(Math.random() * statuses.length)];

          const priority =
            priorities[Math.floor(Math.random() * priorities.length)];

          const estimatedTime = Number(
            (Math.random() * 4 + 1).toFixed(1)
          ); // 1–5 hours

          let actualTime = 0;

          if (status === "completed" || status === "in-progress") {
            actualTime = Number(
              (estimatedTime * (0.7 + Math.random() * 0.6)).toFixed(1)
            ); // realistic variation
          }

          tasks.push({
            title: `Task ${i + 1} - ${priority}`,
            description: `Auto generated task for ${user.name}`,
            status,
            priority,
            assignedTo: user._id,
            createdBy: user._id,
            estimatedTime,
            actualTime,
            createdAt: date,
            updatedAt: date,
          });
        }
      }
    }

    // 4. Insert tasks
    await Task.insertMany(tasks);

    process.exit();
  } catch (error) {
    console.error("Error seeding tasks:", error);
    process.exit(1);
  }
};

seedTasks();