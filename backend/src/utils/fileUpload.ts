import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if keys are provided
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary storage activated.');
} else {
  console.log('Local storage activated for file uploads.');
}

// Local storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.zip', '.png', '.jpg', '.jpeg', '.mp4'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format.'));
    }
  },
});

// Helper function to upload file to Cloudinary if available, otherwise return local URL path
export async function uploadToCloudinaryOrLocal(localPath: string, folder: string): Promise<string> {
  if (useCloudinary) {
    try {
      const result = await cloudinary.uploader.upload(localPath, { folder });
      // Delete local file after uploading to Cloudinary
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
      return result.secure_url;
    } catch (err) {
      console.error('Cloudinary upload error, falling back to local file path:', err);
      // Fallback: return relative local URL path
      return getLocalUrl(localPath);
    }
  }
  return getLocalUrl(localPath);
}

function getLocalUrl(localFilePath: string): string {
  // Convert absolute disk path to a relative URL format '/uploads/filename.ext'
  const filename = path.basename(localFilePath);
  return `/uploads/${filename}`;
}
