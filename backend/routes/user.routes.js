import express from "express";
import {
  getUsers,
  getUserInfo,
  updateUser,
  createUser,
  getUserStats,
  deleteUser,
  getUsersList,
} from "../controllers/userController.js";

import { validateAdmin } from "../middleware/validateAdmin.js";
import { validateUser } from "../middleware/validateUser.js";

const router = express.Router();

/**
 * @desc Create user (Admin only)
 * @route POST /api/users
 */
router.post("/", validateAdmin, createUser);

/**
 * @desc Get logged-in user info
 * @route GET /api/users/info
 */
router.get("/info", getUserInfo);

/**
 * @desc Get all users (Admin only)
 * @route GET /api/users
 */
router.get("/", validateAdmin, getUsers);

/**
 * @desc Get all users (Admin only)
 * @route GET /api/users/list
 */
router.get("/list", validateAdmin, getUsersList);

/**
 * @desc Update user (Admin only)
 * @route PUT /api/users/:id
 */
router.put("/:id", validateAdmin, updateUser);

/**
 * NEW: Get user stats (for View Modal)
 * @route GET /api/users/:id/stats
 */
router.get("/:id/stats", validateAdmin, getUserStats);

router.delete("/:id", validateAdmin, deleteUser);

export default router;