import prisma from "../models/prismaClient.js";

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  const { name, description, price, images, category, stock , AffiliateLink	 } = req.body;
  try {
    const product = await prisma.product.create({
      data: { name, description, price: Number(price), images, category, stock ,AffiliateLink },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, images, category, stock ,AffiliateLink } = req.body;

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: { name, description, price: Number(price), images, category, stock ,AffiliateLink },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({ where: { id } });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

