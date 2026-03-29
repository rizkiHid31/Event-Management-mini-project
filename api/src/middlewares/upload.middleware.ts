import multer from "multer";
import type { FileFilterCallback } from "multer";
import path from "node:path";
import fs from "node:fs";
import type { Request } from "express";

const uploadPath = path.join(process.cwd(), "public");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const timeStamp = Date.now();
    const randomSample = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const finalName = `${timeStamp}-${randomSample}${ext}`;
    cb(null, finalName);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowedMimeTypes = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG, and WebP are allowed"));
  }
};

export const upload = multer({
  storage: diskStorage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // BUG FIX: was 1024 * 1025 * 5
  },
});
