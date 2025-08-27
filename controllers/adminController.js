import jwt from "jsonwebtoken";

// ✅ Verify Admin Token
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


export const verifyAdmin = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT
    jwt.verify(
      token,
      process.env.JWT_SECRET || "aliqannan",
      (err, decoded) => {
        if (err) {
          return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
          });
        }

        // ✅ If token is valid
        return res.json({
          success: true,
          message: "Token is valid",
          admin: decoded,
        });
      }
    );
  } catch (error) {
    console.error("Verify token error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const signupAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Check if email already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists with this email"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = await prisma.adminUser.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword
      }
    });

    // Create JWT token
    const token = jwt.sign(
      {
        id: newAdmin.id,
        email: newAdmin.email
      },
      process.env.JWT_SECRET || "aliqannan",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        createdAt: newAdmin.createdAt
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
