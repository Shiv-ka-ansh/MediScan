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

export default cloudinary;
