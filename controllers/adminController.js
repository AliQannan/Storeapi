// controllers/adminController.js
import prisma from "../models/prismaClient.js";

// ✅ Admin Login
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const admin = await prisma.adminUser.findUnique({ where: { email } });

    if (!admin || admin.password !== password) {
      return res.status(403).json({ error: "Invalid credentials" });
    }

    // You can later add JWT here for secure sessions
    res.status(200).json({
      message: "Login successful",
      admin: { id: admin.id, email: admin.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get all admins
export const getAdmins = async (req, res) => {
  try {
    const admins = await prisma.adminUser.findMany({
      select: { id: true, email: true, createdAt: true },
    });
    res.status(200).json(admins);
  } catch (error) {
    console.error("Get admins error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Create new admin

