import multer from 'multer';
import path from 'path';

const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'text/plain',
];
const allowedExtensions = /jpeg|jpg|png|pdf|txt/;

// Use memory storage — file stays in req.file.buffer
// We'll upload to Cloudinary manually AFTER text extraction succeeds
const storage = multer.memoryStorage();

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
