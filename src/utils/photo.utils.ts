import sharp from 'sharp';
import { BadRequestException } from './error.response';

/**
 * Validates the file size of an uploaded photo.
 * Throws a BadRequestException if the file exceeds the given maxSizeMB.
 */
export const validatePhotoSize = (file: Express.Multer.File, maxSizeMB: number = 5): void => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        throw new BadRequestException(
            `Photo size must not exceed ${maxSizeMB}MB. Received: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
        );
    }
};

/**
 * Aggressively compresses a multer file buffer using 'sharp'.
 * Resizes the image to a standard maximum dimension (e.g., 800x800) maintaining aspect ratio,
 * converts it to JPEG format at 80% quality, and then converts the resulting buffer into
 * a base64 data URI string to be stored efficiently in MongoDB.
 *
 * @param file The multer file object
 * @returns A promise resolving to the compressed base64 JPEG data URI string
 */
export const compressAndEncodePhoto = async (file: Express.Multer.File): Promise<string> => {
    try {
        // Compress using sharp — keep enough resolution and quality for
        // reliable face detection while staying efficient for MongoDB storage.
        const compressedBuffer = await sharp(file.buffer)
            .rotate()
            .resize({
                width: 1024,
                height: 1024,
                fit: 'inside', // maintains aspect ratio, fits within 1024x1024
                withoutEnlargement: true // don't enlarge smaller images
            })
            .jpeg({ quality: 85 })
            .toBuffer();

        // Convert the compressed JPEG buffer into a base64 data URI
        const base64 = compressedBuffer.toString('base64');
        return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
        throw new BadRequestException("Failed to process and compress the uploaded image.");
    }
};
