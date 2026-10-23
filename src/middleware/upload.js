const fs = require("fs");
const path = require("path");
const multer = require("multer");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "products");
const uploadDir = process.env.VERCEL
  ? path.join("/tmp", "uploads", "products")
  : path.join(__dirname, "..", "..", "uploads", "products");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

// Runs after multer parses the multipart form. Copies the saved files' public
// URLs into req.body.image / req.body.images so the existing express-validator
// chains and controllers (which expect those as plain strings/array of
// strings) don't need to know whether the request was JSON or a file upload.
const attachUploadedImageUrls = (req, res, next) => {
  if (req.files?.image?.[0]) {
    req.body.image = `/uploads/products/${req.files.image[0].filename}`;
  }
  if (req.files?.images?.length) {
    req.body.images = req.files.images.map((file) => `/uploads/products/${file.filename}`);
  }
  next();
};

const uploadProductImages = [
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  attachUploadedImageUrls,
];
// ==========================================
// إعدادات رفع صورة البروفايل (Users)
// ==========================================
const USER_UPLOAD_DIR = process.env.VERCEL
  ? path.join("/tmp", "uploads", "users")
  : path.join(__dirname, "..", "..", "uploads", "users");

if (!fs.existsSync(USER_UPLOAD_DIR)) {
  fs.mkdirSync(USER_UPLOAD_DIR, { recursive: true });
}

const userStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, USER_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const uploadUser = multer({ 
  storage: userStorage, 
  fileFilter, 
  limits: { fileSize: MAX_FILE_SIZE } 
});

// دالة بتحط مسار الصورة في req.body.avatar عشان الـ Controller يستخدمه
const attachUserAvatarUrl = (req, res, next) => {
  if (req.file) {
    req.body.avatar = `/uploads/users/${req.file.filename}`;
  }
  next();
};

const uploadUserAvatar = [
  uploadUser.single("avatar"), // بيستقبل حقل واحد اسمه avatar
  attachUserAvatarUrl,
];

module.exports = { uploadProductImages, uploadUserAvatar };