import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authAdmin = (req, res, next) => {
  try {
    const { atoken } = req.headers;

    if (!atoken) {
      // Redirect to login page if no token
      return res.redirect("/");
    }

    const atoken_decode = jwt.verify(atoken, process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET);
    req.body.adminId = atoken_decode.id;

    next();
  } catch (err) {
    // Redirect to login page if token invalid/expired
    return res.redirect("/");
  }
};

export default authAdmin;
