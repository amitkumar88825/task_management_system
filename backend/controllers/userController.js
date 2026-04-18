import User from "../models/UserSchema.js";
import bcrypt from "bcryptjs";
import Task from "../models/TaskSchema.js";


/**
 * @desc Get all users
 * @route GET /api/users
 */
export const getUsers = async (req, res) => {
  try {
    // Fetch users (exclude password)
    const users = await User.find({ role: "user" }).select("-password");

    res.status(200).json(users);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    // ✅ Send only safe user data
    res.status(200).json({
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });

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
 * @desc Get user with task stats
 * @route GET /api/users/:id/stats
 */
export const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("name email role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const total = await Task.countDocuments({ user: id });
    const completed = await Task.countDocuments({ user: id, status: "completed" });
    const pending = await Task.countDocuments({ user: id, status: "pending" });

    res.status(200).json({
      user,
      stats: {
        total,
        completed,
        pending,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};