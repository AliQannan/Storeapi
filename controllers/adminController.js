// controllers/adminController.js
import prisma from "../models/prismaClient.js";

// ✅ Admin Login
export  const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!admin) {  // Fixed: Added 'admin' after the !
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const token = jwt.sign(
      { 
        id: admin.id,
        email: admin.email 
      }, 
      process.env.JWT_SECRET || "aliqannan", // Added fallback for JWT secret
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        createdAt: admin.createdAt
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    
    // Handle specific Prisma errors
    if (err.code === 'P1013' || err.code === 'P1001') {
      return res.status(500).json({
        success: false,
        message: "Database connection error"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
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
