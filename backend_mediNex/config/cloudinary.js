import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// ── Configure Cloudinary SDK ────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Cloudinary Storage for Images (JPEG, PNG, WebP) ─────────────
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "medinex/images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, crop: "limit" }], // Auto-optimize large images
  },
});

// ── Cloudinary Storage for Documents (PDFs + images) ────────────
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "medinex/documents",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
    resource_type: "auto", // Let Cloudinary detect file type (image vs raw for PDF)
  },
});

// ── Cloudinary Storage for Audio (ringtones, etc.) ──────────────
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "medinex/audio",
    resource_type: "video", // Cloudinary uses "video" resource type for all audio files
  },
});

// ── Cloudinary Storage — General (auto-detect all types) ────────
const generalStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "medinex/uploads",
    resource_type: "auto",
  },
});

// ── File filter (kept for safety — reject truly unsupported types) ──
const fileFilter = (req, file, cb) => {
  // Check by MIME type first
  const allowedMimes = [
    "image/jpeg", "image/jpg", "image/png", "image/webp",
    "application/pdf",
  ];
  if (
    allowedMimes.includes(file.mimetype) ||
    file.mimetype.startsWith("audio/") ||
    file.mimetype.startsWith("video/")  // WhatsApp audio sometimes comes as video/mp4
  ) {
    return cb(null, true);
  }

  // Fallback: check file extension (WhatsApp files often have application/octet-stream)
  const ext = file.originalname.split(".").pop().toLowerCase();
  const allowedExts = [
    "jpg", "jpeg", "png", "webp", "pdf",
    "mp3", "wav", "ogg", "m4a", "aac", "mpeg", "opus",
    "flac", "wma", "amr", "3gp", "mp4", "webm",
  ];
  if (allowedExts.includes(ext)) {
    return cb(null, true);
  }

  cb(new Error("Unsupported file type. Allowed: images, pdf, audio files."));
};

// ── Export multer uploaders ─────────────────────────────────────
export const uploadImage = multer({
  storage: imageStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

export const uploadDocument = multer({
  storage: documentStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadAudio = multer({
  storage: audioStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// General-purpose uploader (backward compatible — used in routes)
export const upload = multer({
  storage: generalStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Export cloudinary instance for manual operations (e.g., delete by public_id)
export { cloudinary };
