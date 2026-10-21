// const express = require("express");
// const router = express.Router();
// const {
//   getAllOrders,
//   updateOrderStatus,
//   deleteOrder,
// } = require("../controllers/orderController");

// // استيراد الميدلوير بتاع الحماية (تأكد إن المسار ده صح عندك)
// const { protect, admin } = require("../middleware/authMiddleware");

// // كل المسارات دي محتاجة تسجيل دخول + صلاحية أدمن
// router.use(protect);
// router.use(admin);

// router.get("/", getAllOrders);
// router.patch("/:id/status", updateOrderStatus);
// router.delete("/:id", deleteOrder);

// module.exports = router;
const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

// استدعاء الـ middleware
const authMiddleware = require("../middleware/authMiddleware");

// استخدام الأسماء اللي موجودة فعلاً في ملفك
// (لو أسماء الدوال عندك protect و admin، سيبها زي ما هي. لو أسماء تانية غيرها)
router.use(authMiddleware.protect); 
router.use(authMiddleware.admin);

router.get("/", getAllOrders);
router.patch("/:id/status", updateOrderStatus);
router.delete("/:id", deleteOrder);

module.exports = router;