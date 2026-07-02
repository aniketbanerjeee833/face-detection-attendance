// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';
// import db from '../config/db.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const uploadDir = path.join(__dirname, '../../uploads');
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => {
//     const unique = `emp_${Date.now()}${path.extname(file.originalname)}`;
//     cb(null, unique);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowed = /jpeg|jpg|png/;
//   const ext = allowed.test(path.extname(file.originalname).toLowerCase());
//   const mime = allowed.test(file.mimetype);
//   if (ext && mime) cb(null, true);
//   else cb(new Error('Only JPEG/PNG images allowed'));
// };

// const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// export default upload;


import multer from "multer";
import sharp from "sharp";
import path from "path";
import { mkdir } from "fs/promises";

const uploadDir = path.join(process.cwd(), "uploads");

// Create uploads folder on server startup
await mkdir(uploadDir, { recursive: true });

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG and WEBP images are allowed"));
  }

  cb(null, true);
};

const multerUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

export const uploadEmployeePhoto = [
  multerUpload.single("photo"),

  async (req, res, next) => {
    try {
      if (!req.file) {
        return next();
      }

      const filename = `emp_${Date.now()}.jpg`;

      await sharp(req.file.buffer)
        .rotate() // fixes mobile orientation
        .resize({
          width: 1000,
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 92,
          mozjpeg: true,
        })
        .toFile(path.join(uploadDir, filename));

      req.savedFilename = filename;
      req.savedPhotoUrl = `/uploads/${filename}`;

      next();
    } catch (err) {
      next(err);
    }
  },
];

//2
// import multer from "multer";
// import path from "path";
// import { mkdir } from "fs/promises";

// const uploadDir = path.join(process.cwd(), "uploads");

// // Create uploads directory once on startup
// await mkdir(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     cb(null, uploadDir);
//   },

//   filename: (_req, file, cb) => {
//     cb(null, `emp_${Date.now()}${path.extname(file.originalname)}`);
//   },
// });

// const fileFilter = (_req, file, cb) => {
//   const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

//   if (allowedTypes.includes(file.mimetype)) {
//     return cb(null, true);
//   }

//   cb(new Error("Only JPEG and PNG images are allowed"));
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5 MB
//   },
// });

// export default upload;