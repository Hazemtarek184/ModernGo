import multer, { FileFilterCallback } from 'multer';
import type { Request } from 'express';
import { BadRequestException } from './error.response';

export const fileValidation: {
    image: [string, ...string[]];
} = {
    image: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
}

/**
 * Configure multer for in-memory file uploads with validation
 */
export const fileUpload = ({
    validation = [],
    maxSizeMB = 2,
}: {
    validation?: string[],
    maxSizeMB?: number,
}): multer.Multer => {

    const storage = multer.memoryStorage();

    function fileFilter(req: Request, file: Express.Multer.File, callback: FileFilterCallback) {
        if (!validation.includes(file.mimetype)) {
            return callback(new BadRequestException("validation error",
                {
                    validationError: [{
                        Key: "file",
                        issues: [{ path: "file", message: "Invalid file format" }]
                    }]
                }))
        }
        callback(null, true)
    }

    return multer({ fileFilter, limits: { fileSize: maxSizeMB * 1024 * 1024 }, storage })
}