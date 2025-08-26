import prisma from "../models/prismaClient.js";

export const adminAuth = async (req, res, next) => {
  const { email, password } = req.headers;

  if (!email || !password) {
    return res.status(401).json({ error: "Admin credentials required" });
  }

  try {
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || admin.password !== password) {
      return res.status(403).json({ error: "Invalid admin credentials" });
    }
    req.admin = admin; // attach admin info to request
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

