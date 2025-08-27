import express from "express";
import { loginAdmin, getAdmins, verifyAdmin } from "../controllers/adminController.js";

const router = express.Router();

// Login route
router.post("/login", loginAdmin);

// Get all admins
router.get("/all", getAdmins);

// Verify token
router.get("/verify", verifyAdmin);

export default router;
