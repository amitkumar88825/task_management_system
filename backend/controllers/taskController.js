import Task from "../models/TaskSchema.js";
import mongoose from "mongoose";

/**
 * @desc Add Task
 * @route POST /api/tasks
 */
export const addTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      assignedTo,
      dueDate,
      priority,
      estimatedTime,
      actualTime,
    } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    // Get logged-in user (from middleware)
    const userId = req.user?.id;

    // Create task
    const task = await Task.create({
      title,
      description,
      status,
      assignedTo,
      dueDate,
      priority,
      estimatedTime,
      actualTime,
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

export const getTasks = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    let query = {};

    // Admin → all tasks
    if (req.user.role !== "admin") {
      query.assignedTo = req.user.id;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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
      { new: true },
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
    const { status, actualTime } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // ✅ Only user allowed
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "User only" });
    }

    // ✅ Only own task
    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can update only your tasks",
      });
    }

    // ✅ Update status
    if (status) {
      task.status = status;
    }

    // 🔥 UPDATE ACTUAL TIME (FIX)
    if (actualTime !== undefined) {
      task.actualTime = Number(actualTime);
    }

    await task.save();

    res.status(200).json({
      message: "Task updated successfully",
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
      // NO DATA → NO SCORE
      if (!data.totalTasks || data.totalTasks === 0) {
        return 0;
      }

      const completionRate = (data.completedTasks || 0) / data.totalTasks;

      const efficiency =
        data.totalActualTime > 0
          ? (data.totalEstimatedTime || 0) / data.totalActualTime
          : 0;

      const productivity = completionRate * 70 + efficiency * 30;

      return productivity;
    };

    // ---------- OVERALL ----------
    // ---------- OVERALL ----------
    const overallAgg = await Task.aggregate([
      { $match: { assignedTo: userId } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
          },
          totalActualTime: { $sum: "$actualTime" },
          totalEstimatedTime: { $sum: "$estimatedTime" },
        },
      },
    ]);

    const overall = overallAgg[0] || {
      totalTasks: 0,
      completedTasks: 0,
      pending: 0,
      inProgress: 0,
      totalActualTime: 0,
      totalEstimatedTime: 0,
    };

    const overallScore = calculateScore(overall);

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

    // ---------- FINAL PRODUCTIVITY ----------
    const productivityScore =
      overallScore * 0.4 +
      monthlyScore * 0.3 +
      weeklyScore * 0.2 +
      dailyScore * 0.1;

    res.json({
      stats: {
        total: overall.totalTasks,
        pending: overall.pending,
        inProgress: overall.inProgress,
        completed: overall.completedTasks,
      },
      productivity: {
        overall: Math.round(productivityScore),
        monthly: Math.round(monthlyScore),
        weekly: Math.round(weeklyScore),
        daily: Math.round(dailyScore),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error calculating productivity",
    });
  }
};

/**
 * @desc Delete Task
 * @route DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check valid ObjectId
    if (!id) {
      return res.status(400).json({
        message: "Task ID is required",
      });
    }

    // 2. Find task
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // 3. Only admin can delete
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin only",
      });
    }

    // 4. Delete task
    await Task.findByIdAndDelete(id);

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
