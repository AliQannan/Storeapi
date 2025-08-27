import jwt from "jsonwebtoken";

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
