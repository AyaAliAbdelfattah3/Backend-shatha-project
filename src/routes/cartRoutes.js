const express = require("express");
const {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
} = require("../controllers/cartController");
const {
  addItemValidator,
  updateItemValidator,
  removeItemValidator,
} = require("../validators/cartValidators");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");

const router = express.Router();

// The cart always belongs to the logged-in user, so every route here needs
// a valid session.
router.use(protect);

router.get("/", getCart);
router.post("/items", addItemValidator, validate, addItem);
router.patch("/items/:productId", updateItemValidator, validate, updateItemQuantity);
router.delete("/items/:productId", removeItemValidator, validate, removeItem);
router.delete("/", clearCart);

module.exports = router;
