const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const round2 = (value) => Math.round(value * 100) / 100;

// Populates cart items with their product and adds the per-item/cart totals
// the frontend needs (subtotal, totalItems, totalPrice) — these are derived
// from the *current* product price on every request rather than stored, so
// a price change is always reflected immediately.
const formatCart = async (cart) => {
  await cart.populate("items.product");

  // A product referenced by a cart item may have been deleted by an admin
  // since it was added — drop those rather than crashing on a null product.
  const items = cart.items.filter((item) => item.product);

  const formattedItems = items.map((item) => ({
    product: item.product,
    quantity: item.quantity,
    subtotal: round2(item.product.price * item.quantity),
  }));

  const totalItems = formattedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = round2(formattedItems.reduce((sum, item) => sum + item.subtotal, 0));

  return {
    id: cart._id,
    items: formattedItems,
    totalItems,
    totalPrice,
  };
};

// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);

  res.status(200).json({
    success: true,
    data: { cart: await formatCart(cart) },
  });
});

// @route   POST /api/cart/items
// @access  Private
const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find((item) => item.product.toString() === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();

  res.status(200).json({
    success: true,
    data: { cart: await formatCart(cart) },
  });
});

// @route   PATCH /api/cart/items/:productId
// @access  Private
const updateItemQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((item) => item.product.toString() === productId);

  if (!item) {
    throw new AppError("Item not found in cart", 404);
  }

  item.quantity = quantity;
  await cart.save();

  res.status(200).json({
    success: true,
    data: { cart: await formatCart(cart) },
  });
});

// @route   DELETE /api/cart/items/:productId
// @access  Private
const removeItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const cart = await getOrCreateCart(req.user._id);

  const itemExists = cart.items.some((item) => item.product.toString() === productId);
  if (!itemExists) {
    throw new AppError("Item not found in cart", 404);
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();

  res.status(200).json({
    success: true,
    data: { cart: await formatCart(cart) },
  });
});

// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();

  res.status(200).json({
    success: true,
    data: { cart: await formatCart(cart) },
  });
});

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
};
