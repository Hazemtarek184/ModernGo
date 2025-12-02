import multer from 'multer';
export declare enum StorageEnum {
    memory = "memory",
    disk = "disk"
}
export declare const fileValidation: {
    image: [string, ...string[]];
};
export declare const cloudFileUpload: ({ validation, storageApproach, maxSizeMB, }: {
    validation?: string[];
    storageApproach?: StorageEnum;
    maxSizeMB?: number;
}) => multer.Multer;
//# sourceMappingURL=cloud.multer.d.ts.map