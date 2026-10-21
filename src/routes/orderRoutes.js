const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  createOrder, 
  getMyOrders, // <--- ضيف دي
} = require("../controllers/orderController");

const { protect, isAdmin } = require("../middleware/auth"); 

// ==========================================
// 1. مسارات العميل (محتاجة تسجيل دخول فقط)
// ==========================================
router.post("/", protect, createOrder); 
router.get("/myorders", protect, getMyOrders); // <--- المسار الجديد للعميل

// ==========================================
// 2. مسارات الأدمن (محتاجة تسجيل دخول + صلاحية أدمن)
// ==========================================
router.use(protect);
router.use(isAdmin);

router.get("/", getAllOrders);
router.patch("/:id/status", updateOrderStatus);
router.delete("/:id", deleteOrder);

module.exports = router;