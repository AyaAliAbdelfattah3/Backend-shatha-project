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

module.exports = { register, login, getMe, logout };
