const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

// استخدمنا الاسم الصحيح isAdmin بدل admin
const { protect, isAdmin } = require("../middleware/auth"); 

// حماية المسارات
router.use(protect);
router.use(isAdmin);

router.get("/", getAllOrders);
router.patch("/:id/status", updateOrderStatus);
router.delete("/:id", deleteOrder);

module.exports = router;