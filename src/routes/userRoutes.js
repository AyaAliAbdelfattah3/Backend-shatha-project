const express = require("express");
const {
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");
const { updateUserRoleValidator } = require("../validators/userValidators");
const validate = require("../middleware/validate");
const { protect, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(protect, isAdmin);

router.get("/", getUsers);
router.get("/:id", getUserById);
router.patch("/:id/role", updateUserRoleValidator, validate, updateUserRole);
router.delete("/:id", deleteUser);

module.exports = router;
