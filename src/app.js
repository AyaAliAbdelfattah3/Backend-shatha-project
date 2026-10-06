const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const routes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

// تحديد مجلد الـ uploads ليكون متوافقاً مع Vercel (/tmp) أو المحلي
const uploadDir = process.env.VERCEL
  ? path.join("/tmp", "uploads")
  : path.join(__dirname, "..", "uploads");

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
