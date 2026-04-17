import User from "../models/UserSchema.js";

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





