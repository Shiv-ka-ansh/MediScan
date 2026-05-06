import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});


export async function deleteFromCloudinary(publicId, resourceType = 'raw') {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
        console.log(`🗑️  Cloudinary delete result for ${publicId}:`, result);
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
    }
}

export async function getSignedUrl(publicId, resourceType = 'raw') {
    return cloudinary.url(publicId, {
        resource_type: resourceType,
        secure: true,
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    });
}

/**
 * Upload a multer memory buffer to Cloudinary after local processing succeeds.
 * @param {Buffer} buffer
 * @param {'pdf' | 'image' | 'text'} fileTypeCategory
 */
export function uploadBufferToCloudinary(buffer, fileTypeCategory) {
    const resourceType =
        fileTypeCategory === 'image' ? 'image' : 'raw';

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'mediscan-reports',
                resource_type: resourceType,
                use_filename: true,
                unique_filename: true,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                });
            }
        );
        uploadStream.end(buffer);
    });
}

export default cloudinary;
