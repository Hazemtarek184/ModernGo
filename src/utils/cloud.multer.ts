import multer, { FileFilterCallback } from 'multer';
import os from 'node:os'
import type { Request } from 'express';
import { BadRequestException } from './error.response';
import { v4 as uuid } from 'uuid';

export enum StorageEnum {
    memory = "memory",
    disk = "disk"
}

export const fileValidation = {
    image: ["image/jpeg", "image/jpg","image/png", "image/gif"],
}

export const cloudFileUpload = ({
    validation = [],
    storageApproach = StorageEnum.memory,
    maxSizeMB = 2,
}: {
    validation?: string[],
    storageApproach?: StorageEnum,
    maxSizeMB?: number,

}): multer.Multer => {

    const storage =
        storageApproach === StorageEnum.memory
            ? multer.memoryStorage()
            : multer.diskStorage({
                destination: os.tmpdir(),
                filename: function (
                    req: Request,
                    file: Express.Multer.File,
                    callback
                ) {
                    callback(null, `${uuid()}_${file.originalname}`)
                }

            })


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