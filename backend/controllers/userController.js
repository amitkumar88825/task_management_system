import User from "../models/UserSchema.js";
import bcrypt from "bcryptjs";
import Task from "../models/TaskSchema.js";
import mongoose from 'mongoose'

/**
 * @desc Get all users (paginated)
 * @route GET /api/users?page=1&limit=10
 */
export const getUsers = async (req, res) => {
  try {
    // Get query params
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // Query (only active users if needed)
    const query = {
      role: "user",
      // isActive: true, // 👉 uncomment if you want only active users
    };

    // Fetch users
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit);

    // Total count
    const total = await User.countDocuments(query);

    // Response
    res.status(200).json({
      users,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      hasMore: page * limit < total,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};


/**
 * @desc Get all active users (no pagination)
 * @route GET /api/users/list
 */
export const getUsersList = async (req, res) => {
  try {
    const users = await User.find({
      role: "user",
      isActive: true,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(users);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * @desc Get logged-in user info
 * @route GET /api/users/info
 */
export const getUserInfo = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    const id = req.user.id;

    // Fetch user from DB
    const user = await User.findById(id).select(
      "name email role isActive"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Send safe data
    res.status(200).json(user);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * @desc Update user
 * @route PUT /api/users/:id
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    // 1. Check user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 2. Update fields (only if provided)
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    // 3. Handle password update (optional)
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // 4. Save updated user
    const updatedUser = await user.save();

    // 5. Remove password before sending response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json(userResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * @desc Create new user
 * @route POST /api/users
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user", // default role
    });

    // 5. Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};


/**
 * @desc Get user with full stats
 * @route GET /api/users/:id/stats
 */
export const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate user
    const user = await User.findById(id).select("name email role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userObjectId = new mongoose.Types.ObjectId(id);

const calculateScore = (data) => {

  // ✅ NO DATA → NO SCORE
  if (!data.totalTasks || data.totalTasks === 0) {
    return 0;
  }

  const completionRate =
    (data.completedTasks || 0) / data.totalTasks;

  const efficiency =
    data.totalActualTime > 0
      ? (data.totalEstimatedTime || 0) / data.totalActualTime
      : 0;

  const productivity =
    completionRate * 70 + efficiency * 30;

  return productivity;
};

    // ---------- OVERALL ----------
    const overallAgg = await Task.aggregate([
      { $match: { assignedTo: userObjectId } },
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

    const dailyAgg = await Task.aggregate([
      {
        $match: {
          assignedTo: userObjectId,
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          totalActualTime: { $sum: "$actualTime" },
          totalEstimatedTime: { $sum: "$estimatedTime" },
        },
      },
    ]);

    const daily = dailyAgg[0] || {};
    const dailyScore = calculateScore(daily);

    // ---------- WEEKLY ----------
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const weeklyAgg = await Task.aggregate([
      {
        $match: {
          assignedTo: userObjectId,
          createdAt: { $gte: last7Days },
        },
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          totalActualTime: { $sum: "$actualTime" },
          totalEstimatedTime: { $sum: "$estimatedTime" },
        },
      },
    ]);

    const weekly = weeklyAgg[0] || {};
    const weeklyScore = calculateScore(weekly);

    // ---------- MONTHLY ----------
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyAgg = await Task.aggregate([
      {
        $match: {
          assignedTo: userObjectId,
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          totalActualTime: { $sum: "$actualTime" },
          totalEstimatedTime: { $sum: "$estimatedTime" },
        },
      },
    ]);

    const monthly = monthlyAgg[0] || {};
    const monthlyScore = calculateScore(monthly);

    // ---------- FINAL PRODUCTIVITY ----------
    const productivityScore =
      overallScore * 0.4 +
      monthlyScore * 0.3 +
      weeklyScore * 0.2 +
      dailyScore * 0.1;

    // ---------- FINAL RESPONSE ----------
    res.status(200).json({
      user,
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

      daily,
      weekly,
      monthly,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User deactivated successfully",
      user,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};