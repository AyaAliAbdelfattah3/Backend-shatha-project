require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Product = require("../models/Product");
const products = require("./products");

const users = [
  {
    name: "Admin User",
    email: "admin@test.com",
    password: "Admin123",
    role: "admin",
  },
  {
    name: "Test User One",
    email: "user1@test.com",
    password: "User1123",
    role: "user",
  },
  {
    name: "Test User Two",
    email: "user2@test.com",
    password: "User2123",
    role: "user",
  },
];

const seed = async () => {
  await connectDB();

  await User.deleteMany({ email: { $in: users.map((u) => u.email) } });

  // Passwords are hashed automatically by the User model's pre-save hook.
  await User.create(users);

  await Product.deleteMany({ name: { $in: products.map((p) => p.name) } });

  // Product.create() (not insertMany) so the pre-save slug-generation hook
  // runs for each document.
  await Product.create(products);

  console.log("Seed data created:");
  users.forEach((u) => console.log(`  - ${u.role.padEnd(5)} ${u.email} / ${u.password}`));

  const categories = [...new Set(products.map((p) => p.category))];
  console.log(
    `\n${products.length} products created across ${categories.length} categories: ${categories.join(", ")}`
  );

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
