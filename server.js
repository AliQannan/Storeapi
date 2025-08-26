import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "admin")));

// ✅ Configure CORS
const allowedOrigins = ["https://store-five-tau.vercel.app" , "https://localhost:5000" , "https://storeapi-flame.vercel.app"] 

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use('/api/admin' , adminRoutes)
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin", "login", "dashboard.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
