const { body, param } = require("express-validator");

const addItemValidator = [
  body("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("productId must be a valid id"),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1")
    .toInt(),
];

const updateItemValidator = [
  param("productId").isMongoId().withMessage("productId must be a valid id"),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1")
    .toInt(),
];

const removeItemValidator = [
  param("productId").isMongoId().withMessage("productId must be a valid id"),
];

module.exports = { addItemValidator, updateItemValidator, removeItemValidator };
