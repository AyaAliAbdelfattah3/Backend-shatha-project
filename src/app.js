const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const routes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const connectDB = require("./config/db");
const app = express();

app.use(cors());
app.use(express.json());

// الاتصال بالداتابيز قبل تنفيذ أي API Request على Vercel
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// تحديد مجلد الـ uploads ليكون متوافقاً مع Vercel (/tmp) أو المحلي
const uploadDir = path.join(__dirname, "..", "uploads");

// إنشاء المجلد إذا لم يكن موجوداً لتفادي خطأ ENOENT
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.log("Uploads dir warning:", err.message);
}

// Serves uploaded product images
app.use("/uploads", express.static(uploadDir));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    data: { message: "E-commerce training API is running" },
  });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
