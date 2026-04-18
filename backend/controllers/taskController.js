import Task from "../models/TaskSchema.js";
import mongoose from "mongoose";

/**
 * @desc Add Task
 * @route POST /api/tasks
 */
export const addTask = async (req, res) => {
  try {
    const { title, description, status, assignedTo, dueDate, priority } =
      req.body;

    // ✅ Validation
    if (!title) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    // ✅ Get logged-in user (from middleware)
    const userId = req.user?.id; // make sure protect middleware sets this

    // ✅ Create task
    const task = await Task.create({
      title,
      description,
      status,
      assignedTo,
      dueDate,
      priority,
      createdBy: userId,
    });

    res.status(201).json({
      message: "Task added successfully",
      task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Get Tasks
 * @route GET /api/tasks
 */
export const getTasks = async (req, res) => {
  try {
    let tasks;

    // ✅ If admin → get all tasks
    if (req.user?.role === "admin") {
      tasks = await Task.find()
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });
    } else {
      // ✅ If user → only their tasks
      tasks = await Task.find({
        assignedTo: req.user.id,
      })
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getUserTasks = async (req, res) => {
  try {
    let tasks;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    tasks = await Task.find({ assignedTo: userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * @desc Get task stats (total, pending, in-progress, completed)
 * @route GET /api/tasks/stats
 */
export const getTaskStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Default counts
    let result = {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
    };

    // Map aggregation result
    stats.forEach((item) => {
      result.total += item.count;

      if (item._id === "pending") result.pending = item.count;
      if (item._id === "in-progress") result.inProgress = item.count;
      if (item._id === "completed") result.completed = item.count;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Only admin allowed
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        priority: req.body.priority,
        assignedTo: req.body.assignedTo,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Only user role allowed
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "User only" });
    }

    // User can only update their own task
    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can update only your tasks",
      });
    }

    // Only status update allowed
    task.status = status;

    await task.save();

    res.status(200).json({
      message: "Status updated successfully",
      task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductivity = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // ---------- COMMON FUNCTION ----------
    const calculateScore = (data) => {
      const completionRate =
        (data.completedTasks || 0) / (data.totalTasks || 1);

      const efficiency =
        (data.totalEstimatedTime || 1) /
        (data.totalActualTime || 1);

      return completionRate * 70 + efficiency * 30;
    };

    // ---------- OVERALL ----------
    const overall = await Task.aggregate([
      { $match: { assignedTo: userId } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          totalActualTime: { $sum: "$actualTime" },
          totalEstimatedTime: { $sum: "$estimatedTime" },
        },
      },
    ]);

    const overallScore = calculateScore(overall[0] || {});

    // ---------- DAILY ----------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daily = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          totalActualTime: { $sum: "$actualTime" },
          totalEstimatedTime: { $sum: "$estimatedTime" },
        },
      },
    ]);

    const dailyScore = calculateScore(daily[0] || {});

    // ---------- WEEKLY ----------
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const weekly = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
          createdAt: { $gte: last7Days },
        },
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          totalActualTime: { $sum: "$actualTime" },
          totalEstimatedTime: { $sum: "$estimatedTime" },
        },
      },
    ]);

    const weeklyScore = calculateScore(weekly[0] || {});

    // ---------- MONTHLY ----------
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthly = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          totalActualTime: { $sum: "$actualTime" },
          totalEstimatedTime: { $sum: "$estimatedTime" },
        },
      },
    ]);

    const monthlyScore = calculateScore(monthly[0] || {});

    res.json({
        overall: Math.round(overallScore),
        monthly: Math.round(monthlyScore),
        weekly: Math.round(weeklyScore),
        daily: Math.round(dailyScore),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error calculating productivity",
    });
  }
};


