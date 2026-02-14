import express from "express";
import CustomerController from "./Customer-Controller";
import { validation } from "../middleware/middleware-Validation";
import * as validators from "./Customer-Validation";
import { authenticateCustomer } from "../middleware/auth.middleware";
import { cloudFileUpload, fileValidation, StorageEnum } from "../utils/cloud.multer";

const router = express.Router();

// Register a new customer
router.post(
    "/register",

    cloudFileUpload({
        validation: fileValidation.image,
        storageApproach: StorageEnum.memory,
        maxSizeMB: 5
    }).single('profilePhoto'),
    validation(validators.registerCustomerSchema),
    CustomerController.registerCustomer
);


// router.post(
//     "/verify-photo",
//     authenticateCustomer,
//     cloudFileUpload({
//         validation: fileValidation.image,
//         storageApproach: StorageEnum.memory,
//         maxSizeMB: 5
//     }).single("photo"),
//     CustomerController.verifyPhoto

// )


// Login customer

router.post(
    "/login-photo",
    authenticateCustomer,
    cloudFileUpload({
        validation: fileValidation.image,
        storageApproach: StorageEnum.memory,
        maxSizeMB: 5
    }).single("photo"),
    CustomerController.loginPhoto
);



router.post(
    "/login",
    validation(validators.loginCustomerSchema),
    CustomerController.loginCustomer
);

//Login to store
router.post(
    "/register",

    cloudFileUpload({
        validation: fileValidation.image,
        storageApproach: StorageEnum.memory,
        maxSizeMB: 5
    }).single('profilePhoto'),
    validation(validators.registerCustomerSchema),
    CustomerController.registerCustomer
);

// Get customer profile (Protected route)
router.get(
    "/:customerId",
    authenticateCustomer,
    validation(validators.getCustomerSchema),
    CustomerController.getCustomerProfile
);

// Update customer profile (Protected route)
router.patch(
    "/:customerId",
    authenticateCustomer,
    validation(validators.updateCustomerSchema),
    CustomerController.updateCustomerProfile
);

// Update customer password (Protected route)
router.patch(
    "/:customerId/password",
    authenticateCustomer,
    validation(validators.updatePasswordSchema),
    CustomerController.updatePassword
);

export default router;
