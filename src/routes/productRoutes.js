const express = require("express");
const {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const {
  createProductValidator,
  updateProductValidator,
} = require("../validators/productValidators");
const validate = require("../middleware/validate");
const { protect, isAdmin } = require("../middleware/auth");
const { uploadProductImages } = require("../middleware/upload");

const router = express.Router();

// NOTE: /categories/list must be registered before /:id, otherwise Express
// would match "categories" as the :id param.
router.get("/categories/list", getCategories);

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post(
  "/",
  protect,
  isAdmin,
  uploadProductImages,
  createProductValidator,
  validate,
  createProduct
);
router.put(
  "/:id",
  protect,
  isAdmin,
  uploadProductImages,
  updateProductValidator,
  validate,
  updateProduct
);
router.delete("/:id", protect, isAdmin, deleteProduct);

module.exports = router;
