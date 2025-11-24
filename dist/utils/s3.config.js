"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFolderByPrefix = exports.listDirectoryFiles = exports.deleteFiles = exports.deleteFile = exports.getFile = exports.createGetPreSignedLink = exports.createPreSignUploadLink = exports.uploadLargeFile = exports.uploadFiles = exports.uploadFile = exports.s3Config = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const cloud_multer_1 = require("./cloud.multer");
const node_fs_1 = require("node:fs");
const error_response_1 = require("./error.response");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3Config = () => {
    return new client_s3_1.S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_KEY_ID
        }
    });
};
exports.s3Config = s3Config;
const uploadFile = async ({ storageApproach = cloud_multer_1.StorageEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", file, }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        ACL,
        Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}_${file.originalname}`,
        Body: storageApproach === cloud_multer_1.StorageEnum.memory ? file.buffer : (0, node_fs_1.createReadStream)(file.path),
        ContentType: file.mimetype,
    });
    await (0, exports.s3Config)().send(command);
    if (!command?.input.Key) {
        throw new error_response_1.BadRequestException('fail to upload file');
    }
    return command.input.Key;
};
exports.uploadFile = uploadFile;
const uploadFiles = async ({ storageApproach = cloud_multer_1.StorageEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", files, useLarge = false, }) => {
    let urls = [];
    if (useLarge) {
        urls = await Promise.all(files.map((file) => {
            return (0, exports.uploadLargeFile)({
                file,
                path,
                ACL,
                Bucket,
                storageApproach,
            });
        }));
    }
    else {
        urls = await Promise.all(files.map((file) => {
            return (0, exports.uploadFile)({
                file,
                path,
                ACL,
                Bucket,
                storageApproach,
            });
        }));
    }
    return urls;
};
exports.uploadFiles = uploadFiles;
const uploadLargeFile = async ({ storageApproach = cloud_multer_1.StorageEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", file, }) => {
    const upload = new lib_storage_1.Upload({
        client: (0, exports.s3Config)(),
        params: {
            Bucket,
            ACL,
            Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}_${file.originalname}`,
            Body: storageApproach === cloud_multer_1.StorageEnum.memory ? file.buffer : (0, node_fs_1.createReadStream)(file.path),
            ContentType: file.mimetype,
        }
    });
    upload.on("httpUploadProgress", (progress) => {
        console.log(`Upload file progress is :::`, progress);
    });
    const { Key } = await upload.done();
    if (!Key) {
        throw new error_response_1.BadRequestException('fail to upload file');
    }
    return Key;
};
exports.uploadLargeFile = uploadLargeFile;
const createPreSignUploadLink = async ({ Bucket = process.env.AWS_BUCKET_NAME, path = "general", ContentType, Originalname, expiresIn = Number(process.env.AWS_PRE_SIGN_URL_EXPIRES_IN) || 60, }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}_${Originalname}`,
        ContentType,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, exports.s3Config)(), command, { expiresIn });
    if (!command?.input?.Key || !url) {
        throw new error_response_1.BadRequestException("Failed to generate presigned URL");
    }
    return { url, key: command.input.Key };
};
exports.createPreSignUploadLink = createPreSignUploadLink;
const createGetPreSignedLink = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, expiresIn = Number(process.env.AWS_PRE_SIGN_URL_EXPIRES_IN), filename, download, }) => {
    const command = new client_s3_1.GetObjectCommand({
        Bucket,
        Key,
        ResponseContentDisposition: download === "true"
            ? `attachment; filename="${filename || Key.split(" / ").pop()}"`
            : undefined,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, exports.s3Config)(), command, { expiresIn });
    return url;
};
exports.createGetPreSignedLink = createGetPreSignedLink;
const getFile = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, }) => {
    const command = new client_s3_1.GetObjectCommand({
        Bucket,
        Key,
    });
    return await (0, exports.s3Config)().send(command);
};
exports.getFile = getFile;
const deleteFile = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, }) => {
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket,
        Key,
    });
    return await (0, exports.s3Config)().send(command);
};
exports.deleteFile = deleteFile;
const deleteFiles = async ({ Bucket = process.env.AWS_BUCKET_NAME, urls, Quiet, }) => {
    const Objects = urls.map(url => {
        return { Key: url };
    });
    const command = new client_s3_1.DeleteObjectsCommand({
        Bucket,
        Delete: {
            Objects,
            Quiet,
        }
    });
    return await (0, exports.s3Config)().send(command);
};
exports.deleteFiles = deleteFiles;
const listDirectoryFiles = async ({ Bucket = process.env.AWS_BUCKET_NAME, path, }) => {
    const command = new client_s3_1.ListObjectsV2Command({
        Bucket,
        Prefix: `${process.env.APPLICATION_NAME}/${path}`,
    });
    return (0, exports.s3Config)().send(command);
};
exports.listDirectoryFiles = listDirectoryFiles;
const deleteFolderByPrefix = async ({ Bucket = process.env.AWS_BUCKET_NAME, path, Quiet = false, }) => {
    const fileList = await (0, exports.listDirectoryFiles)({ Bucket, path });
    if (!fileList?.Contents) {
        throw new error_response_1.BadRequestException("empty directory");
    }
    const urls = fileList.Contents.map((file) => {
        return file.Key;
    });
    return await (0, exports.deleteFiles)({ urls, Bucket, Quiet });
};
exports.deleteFolderByPrefix = deleteFolderByPrefix;
//# sourceMappingURL=s3.config.js.map