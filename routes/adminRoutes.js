import express from "express";
import { loginAdmin, signupAdmin, getAdmins, verifyAdmin } from "../controllers/adminController.js";

const router = express.Router();

router.post("/signup", signupAdmin);  // new route
router.post("/login", loginAdmin);
router.get("/", getAdmins);
router.get("/verify", verifyAdmin);

export default router;
