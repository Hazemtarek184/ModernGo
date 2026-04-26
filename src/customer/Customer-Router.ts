import express from "express";
import CustomerController from "./Customer-Controller";
import { validation } from "../middleware/middleware-Validation";
import * as validators from "./Customer-Validation";
import { authenticateCustomer } from "../middleware/auth.middleware";
import { fileUpload, fileValidation } from "../utils/cloud.multer";

const router = express.Router();

// Register a new customer (with profile photo upload)
router.post(
    "/register",
    fileUpload({
        validation: fileValidation.image,
        maxSizeMB: 5
    }).single('profilePhoto'),
    validation(validators.registerCustomerSchema),
    CustomerController.registerCustomer
);

// Login customer
router.post(
    "/login",
    validation(validators.loginCustomerSchema),
    CustomerController.loginCustomer
);

// Get the authenticated customer's own profile
// Must be placed before /:customerId so "me" isn't treated as an ID
router.get(
    "/me",
    authenticateCustomer,
    CustomerController.getMe
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

// Submit verification photo for AI processing (Protected route)
// TODO: Complete socket integration when AI service is ready
router.post(
    "/:customerId/verify-photo",
    authenticateCustomer,
    fileUpload({
        validation: fileValidation.image,
        maxSizeMB: 5
    }).single('verificationPhoto'),
    validation(validators.verifyPhotoSchema),
    CustomerController.submitVerificationPhoto
);

export default router;
