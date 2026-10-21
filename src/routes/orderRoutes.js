const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  createOrder, // <--- ضيف دي
} = require("../controllers/orderController");

const { protect, isAdmin } = require("../middleware/auth"); 

// --- مسارات محتاجة تسجيل دخول (للعملاء) ---
router.post("/", protect, createOrder); // <--- ضيف السطر ده

// --- مسارات محتاجة تسجيل دخول + صلاحية أدمن ---
router.use(protect);
router.use(isAdmin);

router.get("/", getAllOrders);
router.patch("/:id/status", updateOrderStatus);
router.delete("/:id", deleteOrder);

module.exports = router;