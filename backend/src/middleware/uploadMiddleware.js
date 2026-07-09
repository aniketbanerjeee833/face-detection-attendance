
// import multer from "multer";
// import sharp from "sharp";
// import path from "path";
// import { mkdir } from "fs/promises";

// const uploadDir = path.join(process.cwd(), "uploads");
// const idProofDir = path.join(process.cwd(), "uploads", "id_proofs"); // ← separate subfolder

// await mkdir(uploadDir, { recursive: true });
// await mkdir(idProofDir, { recursive: true }); // ← create on startup

// const fileFilter = (_req, file, cb) => {
//   const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
//   if (!allowedMimeTypes.includes(file.mimetype)) {
//     return cb(new Error("Only JPEG, PNG and WEBP images are allowed"));
//   }
//   cb(null, true);
// };

// const multerUpload = multer({
//   storage: multer.memoryStorage(),
//   fileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10 MB
//   },
// });

// export const uploadEmployeePhoto = [
//   // 'photo' = face photo (required elsewhere in your controller logic)
//   // 'id_proof' = optional ID document photo (Aadhar card, voter ID, etc.)
//   multerUpload.fields([
//     { name: "photo", maxCount: 1 },
//     { name: "id_proof", maxCount: 1 },
//   ]),
//   async (req, res, next) => {
//     try {
//       const photoFile = req.files?.photo?.[0];
//       const idProofFile = req.files?.id_proof?.[0];

//       // ── Face photo (existing logic, unchanged) ──────────────────────
//       if (photoFile) {
//         const filename = `emp_${Date.now()}.jpg`;
//         await sharp(photoFile.buffer)
//           .rotate()
//           .resize({ width: 1000, withoutEnlargement: true })
//           .jpeg({ quality: 92, mozjpeg: true })
//           .toFile(path.join(uploadDir, filename));

//         req.savedFilename = filename;
//         req.savedPhotoUrl = `/uploads/${filename}`;
//       }

//       // ── ID proof photo (new, optional, separate folder) ─────────────
//       if (idProofFile) {
//         const idFilename = `idproof_${Date.now()}.jpg`;
//         await sharp(idProofFile.buffer)
//           .rotate()
//           .resize({ width: 1400, withoutEnlargement: true }) // slightly larger — documents need more readable detail than a face crop
//           .jpeg({ quality: 92, mozjpeg: true })
//           .toFile(path.join(idProofDir, idFilename));

//         req.savedIdProofFilename = idFilename;
//         req.savedIdProofUrl = `/uploads/id_proofs/${idFilename}`;
//       }

//       next();
//     } catch (err) {
//       next(err);
//     }
//   },
// ];

import multer from "multer";
import sharp from "sharp";
import path from "path";
import { mkdir } from "fs/promises";
import { AppError } from "./errorHandler.js";

const uploadDir = path.join(process.cwd(), "uploads");
const idProofDir = path.join(process.cwd(), "uploads", "id_proofs");

await mkdir(uploadDir, { recursive: true });
await mkdir(idProofDir, { recursive: true });

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG and WEBP images are allowed"));
  }
  cb(null, true);
};

const multerUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const MIN_VALID_BUFFER_BYTES = 1000;

export const uploadEmployeePhoto = [
  multerUpload.fields([
    { name: "photo", maxCount: 1 },
    { name: "id_proof", maxCount: 1 },
  ]),
  async (req, res, next) => {
    const photoFile = req.files?.photo?.[0];
    const idProofFile = req.files?.id_proof?.[0];

    if (photoFile) {
      if (!photoFile.buffer || photoFile.buffer.length < MIN_VALID_BUFFER_BYTES) {
        return next(new AppError("Captured photo looks empty or corrupted. Please retake it.", 400));
      }
      const filename = `emp_${Date.now()}.jpg`;
      try {
        await sharp(photoFile.buffer)
          .rotate()
          .resize({ width: 1000, withoutEnlargement: true })
          .jpeg({ quality: 92, mozjpeg: true })
          .toFile(path.join(uploadDir, filename));
        req.savedFilename = filename;
        req.savedPhotoUrl = `/uploads/${filename}`;
      } catch (sharpErr) {
        console.error("Sharp failed on photo:", sharpErr.message);
        return next(new AppError("Could not process the captured photo. Please retake it.", 400));
      }
    }

    if (idProofFile) {
      if (!idProofFile.buffer || idProofFile.buffer.length < MIN_VALID_BUFFER_BYTES) {
        return next(new AppError("Captured ID proof looks empty or corrupted. Please retake it.", 400));
      }
      const idFilename = `idproof_${Date.now()}.jpg`;
      try {
        await sharp(idProofFile.buffer)
          .rotate()
          .resize({ width: 1400, withoutEnlargement: true })
          .jpeg({ quality: 92, mozjpeg: true })
          .toFile(path.join(idProofDir, idFilename));
        req.savedIdProofFilename = idFilename;
        req.savedIdProofUrl = `/uploads/id_proofs/${idFilename}`;
      } catch (sharpErr) {
        console.error("Sharp failed on id_proof:", sharpErr.message);
        return next(new AppError("Could not process the captured ID proof. Please retake it.", 400));
      }
    }

    next();
  },
];

// import multer from "multer";
// import sharp from "sharp";
// import path from "path";
// import { mkdir } from "fs/promises";

// const uploadDir = path.join(process.cwd(), "uploads");

// // Create uploads folder on server startup
// await mkdir(uploadDir, { recursive: true });

// const fileFilter = (_req, file, cb) => {
//   const allowedMimeTypes = [
//     "image/jpeg",
//     "image/jpg",
//     "image/png",
//     "image/webp",
//   ];

//   if (!allowedMimeTypes.includes(file.mimetype)) {
//     return cb(new Error("Only JPEG, PNG and WEBP images are allowed"));
//   }

//   cb(null, true);
// };

// const multerUpload = multer({
//   storage: multer.memoryStorage(),
//   fileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10 MB
//   },
// });

// export const uploadEmployeePhoto = [
//   multerUpload.single("photo"),

//   async (req, res, next) => {
//     try {
//       if (!req.file) {
//         return next();
//       }

//       const filename = `emp_${Date.now()}.jpg`;

//       await sharp(req.file.buffer)
//         .rotate() // fixes mobile orientation
//         .resize({
//           width: 1000,
//           withoutEnlargement: true,
//         })
//         .jpeg({
//           quality: 92,
//           mozjpeg: true,
//         })
//         .toFile(path.join(uploadDir, filename));

//       req.savedFilename = filename;
//       req.savedPhotoUrl = `/uploads/${filename}`;

//       next();
//     } catch (err) {
//       next(err);
//     }
//   },
// ];


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