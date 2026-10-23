const express = require("express");
const { 
  register, 
  login, 
  getMe, 
  logout, 
  updateProfile, 
  updatePassword 
} = require("../controllers/authController");
const { uploadUserAvatar } = require("../middleware/upload");  
const { updateAvatar } = require("../controllers/authController");

const { registerValidator, loginValidator } = require("../validators/authValidators");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

// ==== المسارات الجديدة الخاصة بتحديث البروفايل والباسورد ====
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);
router.put("/avatar", protect, uploadUserAvatar, updateAvatar);

module.exports = router;