
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// User authentication middleware for admin
const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers || localStorage.getItem('atoken');

    if (!atoken) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please login again.",
      });
    }

    // Verify token using environment variable
    const atoken_decode = jwt.verify(atoken, process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET);
    
    // Add admin ID to request body
    req.body.adminId = atoken_decode.id;

    next();
  } catch (err) {
    res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};

export default authAdmin;
