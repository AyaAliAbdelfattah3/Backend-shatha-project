const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const Product = require("../models/Product");

const SORT_OPTIONS = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  newest: { createdAt: -1 },
  rating: { rating: -1 },
};

const MAX_LIMIT = 100;

// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, sort, featured } = req.query;

  const filter = {};

  if (search) {
    filter.$text = { $search: search };
  }

  if (category) {
    filter.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  if (featured === "true") {
    filter.isFeatured = true;
  }

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;

  const sortOption = SORT_OPTIONS[sort] || { createdAt: -1 };

  const [products, totalProducts] = await Promise.all([
    Product.find(filter).sort(sortOption).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      products,
      page,
      totalPages: Math.max(Math.ceil(totalProducts / limit), 1),
      totalProducts,
    },
  });
});

// @route   GET /api/products/categories/list
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct("category");

  res.status(200).json({
    success: true,
    data: categories,
  });
});

// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.status(200).json({
    success: true,
    data: { product },
  });
});

// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    image,
    images,
    category,
    brand,
    countInStock,
    isFeatured,
  } = req.body;

  const product = await Product.create({
    name,
    description,
    price,
    image,
    images,
    category,
    brand,
    countInStock,
    isFeatured,
  });

  res.status(201).json({
    success: true,
    data: { product },
  });
});

// @route   PUT /api/products/:id
// @access  Private/Admin
const UPDATABLE_FIELDS = [
  "name",
  "description",
  "price",
  "image",
  "images",
  "category",
  "brand",
  "countInStock",
  "isFeatured",
  "rating",
  "numReviews",
];

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  UPDATABLE_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  await product.save();

  res.status(200).json({
    success: true,
    data: { product },
  });
});

// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    data: { message: "Product deleted successfully" },
  });
});

module.exports = {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
