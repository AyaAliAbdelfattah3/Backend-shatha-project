const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const User = require("../models/User");

// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { users },
  });
});

// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// @route   PATCH /api/users/:id/role
// @access  Private/Admin
// An admin can't change their own role - prevents an admin from locking
// themselves out (or the last admin demoting themselves) by mistake.
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (req.params.id === String(req.user._id)) {
    throw new AppError("You cannot change your own role", 400);
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    throw new AppError("You cannot delete your own account", 400);
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: { message: "User deleted successfully" },
  });
});

module.exports = { getUsers, getUserById, updateUserRole, deleteUser };
