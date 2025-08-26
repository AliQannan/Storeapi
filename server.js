import express from "express";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());

app.use("/api/products", productRoutes);
app.get("/" , (req,res)=>{

	return res.json(" running good")

	
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

