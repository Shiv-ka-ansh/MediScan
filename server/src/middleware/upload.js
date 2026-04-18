import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'text/plain',
];
const allowedExtensions = /jpeg|jpg|png|pdf|txt/;

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const ext = path.extname(file.originalname).toLowerCase().slice(1);
        const isImage = ['jpg', 'jpeg', 'png'].includes(ext);

        return {
            folder: 'mediscan/reports',
            resource_type: isImage ? 'image' : 'raw',
            public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
            // Keep original format for non-image files
            ...(isImage ? {} : { format: ext }),
        };
    },
});

const fileFilter = (req, file, cb) => {
    const extname = allowedExtensions.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, images (JPG/PNG), and text files are allowed.'));
    }
};

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
    fileFilter: fileFilter,
});
