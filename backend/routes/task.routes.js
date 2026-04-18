





import express from "express";
import { addTask, 
    getTasks, 
    getTaskStats, 
    getUserTasks, 
    updateTask, 
    updateTaskStatus, 
    getProductivity, 
  } from "../controllers/taskController.js";
import {validateAdmin} from "../middleware/validateAdmin.js";
import {validateUser} from "../middleware/validateUser.js"


const router = express.Router();

router.post("/", validateAdmin, addTask);
router.get("/", validateAdmin, getTasks);
router.put("/:id", validateAdmin, updateTask);
router.put("/update-status/:id", validateUser, updateTaskStatus);
router.get("/stats", validateAdmin, getTaskStats);
router.get("/user-tasks", validateUser, getUserTasks);
router.get("/productivity", getProductivity);


export default router;