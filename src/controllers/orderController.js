const Order = require("../models/Order");

const User = require("../models/User"); // ضيف السطر ده
const Product = require("../models/Product"); // وضيف السطر ده

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