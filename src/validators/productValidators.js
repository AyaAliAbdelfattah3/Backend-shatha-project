const { body } = require("express-validator");

const createProductValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("image").trim().notEmpty().withMessage("Main image URL is required"),
  body("images").optional().isArray().withMessage("Images must be an array of URLs"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("brand").optional().trim(),
  body("countInStock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Count in stock cannot be negative"),
  body("isFeatured").optional().isBoolean().withMessage("isFeatured must be true or false"),
];

const updateProductValidator = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("description").optional().trim().notEmpty().withMessage("Description cannot be empty"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("image").optional().trim().notEmpty().withMessage("Main image URL cannot be empty"),
  body("images").optional().isArray().withMessage("Images must be an array of URLs"),
  body("category").optional().trim().notEmpty().withMessage("Category cannot be empty"),
  body("brand").optional().trim(),
  body("countInStock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Count in stock cannot be negative"),
  body("isFeatured").optional().isBoolean().withMessage("isFeatured must be true or false"),
];

module.exports = { createProductValidator, updateProductValidator };
