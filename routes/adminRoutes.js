

import express from "express";
import { loginAdmin, getAdmins } from "../controllers/adminController.js";

const router = express.Router();

router.post("/login", loginAdmin);        // Login
router.get("/all", getAdmins);       // Get all admins


export default router ;
