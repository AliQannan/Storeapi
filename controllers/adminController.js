import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; // ✅ Fixed: Added missing 'from "bcrypt"'
import prisma from "../models/prismaClient.js";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// ✅ Admin Login
export const loginAdmin = async (req, res) => {
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

    if (!admin) {
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
        email: admin.email,
        role: admin.role // ✅ Added role to token
      }, 
      process.env.JWT_SECRET || "aliqannan",
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role // ✅ Added role to response
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
      select: { 
        id: true, 
        email: true, 
        role: true, // ✅ Added role selection
        createdAt: true 
      },
    });
    res.status(200).json({
      success: true,
      admins: admins
    });
  } catch (error) {
    console.error("Get admins error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

// ✅ Verify Admin Token
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
      async (err, decoded) => { // ✅ Made callback async
        if (err) {
          return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
          });
        }

        try {
          // ✅ Optional: Verify admin still exists in database
          const admin = await prisma.adminUser.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true }
          });

          if (!admin) {
            return res.status(401).json({
              success: false,
              message: "Admin not found",
            });
          }

          return res.json({
            success: true,
            message: "Token is valid",
            admin: admin,
          });
        } catch (dbError) {
          console.error("Database error during verification:", dbError);
          return res.status(500).json({
            success: false,
            message: "Database error",
          });
        }
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

// ✅ Admin Signup
export const signupAdmin = async (req, res) => {
  try {
    console.log('Signup request body:', req.body);
    
    const { email, password, role } = req.body;

    // Validate input presence
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and role are required"
      });
    }

    // Validate role
    const validRoles = ['super_admin', 'admin', 'moderator', 'editor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected. Must be one of: super_admin, admin, moderator, editor"
      });
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Validate password strength
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    console.log('Checking for existing admin with email:', normalizedEmail);

    // Check if email already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin already exists with this email"
      });
    }

    console.log('Hashing password...');

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('Creating new admin...');

    // Create new admin
    const newAdmin = await prisma.adminUser.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        role: role
      }
    });

    console.log('Admin created successfully:', newAdmin.id);

    // Ensure JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: "24h"
      }
    );

    console.log(`New admin created: ${newAdmin.email} with role: ${newAdmin.role} at ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });

  } catch (err) {
    console.error("Admin signup error details:", {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    
    // Handle specific Prisma errors
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "Admin already exists with this email"
      });
    }

    // Handle Prisma connection errors
    if (err.code === 'P1001') {
      return res.status(500).json({
        success: false,
        message: "Database connection failed"
      });
    }

    // Handle validation errors
    if (err.code === 'P2000') {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
