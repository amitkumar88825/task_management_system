








import express from "express";
import { getUsers, getUserInfo } from "../controllers/userController.js";
import {validateAdmin} from "../middleware/validateAdmin.js";
import {validateUser} from "../middleware/validateUser.js"


const router = express.Router();

router.get("/info", validateUser, getUserInfo);
router.get("/", validateAdmin, getUsers);



export default router;