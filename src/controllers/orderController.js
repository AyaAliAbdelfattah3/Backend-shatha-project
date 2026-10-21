const Order = require("../models/Order");
// السطرين دول مهمين جداً عشان الـ populate يشتغل في Vercel من غير مشاكل
require("../models/User");
require("../models/Product");

// 1. جلب كل الطلبات (للأدمن)
exports.getAllOrders = async (req, res) => {
  try {
    // populate بتجيب بيانات المستخدم والمنتج المرتبطين بالطلب
    const orders = await Order.find()
      .populate("user", "name email")
      .sort("-createdAt"); // الأحدث الأول

    res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (User)
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No order items" });
    }

    // إنشاء الطلب الجديد وربطه بالعميل اللي عامله Login
    const order = new Order({
      user: req.user._id, // جاي من الـ protect middleware
      items,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    const createdOrder = await order.save();

    res.status(201).json({ success: true, data: { order: createdOrder } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private (User)
exports.getMyOrders = async (req, res) => {
  try {
    // بنجيب الطلبات اللي الـ user بتاعها هو نفس العميل اللي داخل
    const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
    res.status(200).json({ success: true, data: { orders } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// 2. تعديل حالة الطلب (للأدمن)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. حذف طلب (للأدمن)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};