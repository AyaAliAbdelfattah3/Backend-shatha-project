const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const generateToken = require("../utils/generateToken");
const User = require("../models/User");

// @route   POST /api/auth/register
// @access  Public
// Role is never read from req.body - every user created here is "user".
// Promoting someone to "admin" is a deliberate, separate action (e.g. done
// directly in the DB or by an admin-only endpoint in a later lecture), never
// something a client can request for itself at signup.
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.create({ name, email, password, role: "user" });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // .select("+password") is required because the schema marks password as
  // select: false by default.
  const user = await User.findOne({ email }).select("+password");

  // Same generic message whether the email doesn't exist or the password is
  // wrong - confirming which one it was would let an attacker enumerate
  // registered emails.
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // req.user was already loaded (without the password) by the `protect` middleware.
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    },
  });
});

// @route   POST /api/auth/logout
// @access  Private
// JWTs are stateless: the server never stores issued tokens, so it cannot
// "revoke" one. This endpoint exists for a predictable frontend contract
// (POST /logout that returns 200), but the real logout happens client-side
// by deleting the stored token. The token itself stays technically valid
// until it expires (JWT_EXPIRE) even after this call.
// A production app that needs true server-side revocation (e.g. "log out
// this device remotely") would need a token blacklist/allowlist or short-lived
// access tokens + refresh tokens - out of scope for this lecture.
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: "Logged out successfully",
    },
  });
});
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  
  // لو حقل التليفون موجود في الموديل بتاعك، هنحدثه. لو مش موجود، السطر ده مش هيأثر
  if (req.body.phone) {
    user.phone = req.body.phone;
  }

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || "", // لو الحقل مش موجود بيرجع فاضي
        role: updatedUser.role,
      },
    },
  });
});

// @route   PUT /api/auth/password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // بنتأكد إن الباسورد القديم صح
  const isMatch = await user.comparePassword(req.body.currentPassword);
  
  if (!isMatch) {
    throw new AppError("Incorrect current password", 401);
  }

  // بنغير الباسورد
  user.password = req.body.newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});
module.exports = { register, login, getMe, logout, updateProfile, updatePassword };