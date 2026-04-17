





import express from "express";
import { addTask, 
    getTasks, 
    getTaskStats, 
    getUserTasks, 
    getUserTaskReport, 
    updateTask, 
    updateTaskStatus, 
    getProductivity, 
    getWeeklyStats, 
    getDailyStats,
    getMonthlyStats  } from "../controllers/taskController.js";
import {validateAdmin} from "../middleware/validateAdmin.js";
import {validateUser} from "../middleware/validateUser.js"


const router = express.Router();

router.post("/", validateAdmin, addTask);
router.get("/", validateAdmin, getTasks);
router.put("/:id", validateAdmin, updateTask);
router.put("/update-status/:id", validateUser, updateTaskStatus);
router.get("/stats", validateAdmin, getTaskStats);
router.get("/user-tasks", validateUser, getUserTasks);
router.get("/user-tasks-report", validateUser, getUserTaskReport);
router.get("/daily-stats", getDailyStats);
router.get("/weekly-stats", getWeeklyStats);
router.get("/productivity", getProductivity);
router.get("/monthly-stats", getMonthlyStats);


export default router;