// routes/index.js

import express from "express";
import authRoutes from "./auth.routes.js";
import taskRoutes from "./task.routes.js";
import userRoutes from "./user.routes.js";
import {protect} from "../middleware/protect.js"

const router = express.Router();

// Auth routes
router.use("/auth", authRoutes);


router.use("/tasks", protect, taskRoutes);
router.use("/users", protect, userRoutes);


export default router;