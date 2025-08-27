// controllers/adminController.js
import prisma from "../models/prismaClient.js";

// ✅ Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
   
    const admin = await adminModel.findOne({ email });
    

    if (!admin) {
      return res.json({ success: false, message: "admin does not exist" });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (isMatch) {
      const token = jwt.sign({ id: admin._id },"aliqannan");
      res.json({ message : "Login successfuly" , success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
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


export {loginAdmin} ;

