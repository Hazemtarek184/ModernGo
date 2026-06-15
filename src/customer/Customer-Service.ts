import { sendPersonImagesToAI } from "../socket/Socket-Server";
import { Types } from "mongoose";
import { CustomerModel } from "./Customer-Module";
import { CustomerRepository } from "../DB/repository/Customer-Repository";
import { BadRequestException, NotFoundException } from "../utils/error.response";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.utils";
import { HydratedDocument, Model } from "mongoose";
import { ICustomer } from "../types/Customer-Interface";

interface RegisterCustomerDto {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    profilePhoto: string;
    address?: {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    } | undefined;
}

interface LoginCustomerDto {
    email: string;
    password: string;
}

interface UpdateCustomerDto {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    address?: {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    } | undefined;
}

interface UpdatePasswordDto {
    currentPassword: string;
    newPassword: string;
}

class CustomerService {
    findByIdAndUpdate(_id: Types.ObjectId, arg1: { profilePhotoKey: string; }) {
        throw new Error("Method not implemented.");
    }

    // findByIdAndUpdate(_id: any, arg1: { profilePhotoKey: any; }) {
    //     throw new Error("Method not implemented.");
    // }

    private customerRepository = new CustomerRepository(
        CustomerModel as Model<HydratedDocument<ICustomer>>,
    ); constructor() { }


    async updateProfilePhotoKey(customerId: string, profilePhotoKey: string) {
        if (!Types.ObjectId.isValid(customerId)) {
            throw new BadRequestException("Invalid customerId format");
        }


        const updatedCustomer = await this.customerRepository.findOneAndUpdate({
            filter: { _id: new Types.ObjectId(customerId) },
            update: { profilePhotoKey },
            options: { new: true }
        });

        if (!updatedCustomer) {
            throw new NotFoundException("Customer not found");
        }

        return updatedCustomer;
    }


    async updateLoginPhotoValue(customerId: string, loginPhotoValue: string) {
        if (!Types.ObjectId.isValid(customerId)) {
            throw new BadRequestException("Invalid customerId format");
        }

        const updatedCustomer = await this.customerRepository.findOneAndUpdate({
            filter: { _id: new Types.ObjectId(customerId) },
            update: { loginPhotoValue },
            options: { new: true }
        });

        if (!updatedCustomer) throw new NotFoundException("Customer not found");
        return updatedCustomer;
    }




    /**
     * Register a new customer
     */
    async registerCustomer(dto: RegisterCustomerDto) {
        // Check if email already exists
        const existingEmail = await this.customerRepository.findByEmail(dto.email);
        if (existingEmail) {
            throw new BadRequestException("Email already registered");
        }

        // Check if phone already exists
        const existingPhone = await this.customerRepository.findByPhone(dto.phone);
        if (existingPhone) {
            throw new BadRequestException("Phone number already registered");
        }

        // Create customer (password will be hashed by pre-save hook)
        const [customer] = await this.customerRepository.create({
            data: [{
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email.toLowerCase().trim(),
                phone: dto.phone.trim(),
                password: dto.password,
                profilePhoto: dto.profilePhoto,
                address: dto.address,
            }]
        });

        if (!customer) {
            throw new BadRequestException("Failed to create customer account");
        }

        // Return customer without password and profilePhoto (both are select: false fields)
        const customerObject = customer.toObject();
        const { password, profilePhotoKey, ...customerWithoutSensitive } = customerObject;

        // Generate JWT token
        const token = generateToken(customer._id!, customer.email, 'customer');

        return {
            customer: customerWithoutSensitive,
            token
        };
    }

    /**
     * Login customer
     */
    async loginCustomer(dto: LoginCustomerDto) {
        // Find customer by email with password field
        const customer = await this.customerRepository.findByEmailWithPassword(dto.email);

        if (!customer) {
            throw new BadRequestException("Invalid email or password");
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(dto.password, customer.password);

        if (!isPasswordValid) {
            throw new BadRequestException("Invalid email or password");
        }

        // Return customer without password
        const customerObject = customer.toObject();
        const { password, ...customerWithoutPassword } = customerObject;

        // Generate JWT token
        const token = generateToken(customer._id!, customer.email, 'customer');

        return {
            customer: customerWithoutPassword,
            token
        };
    }

    /**
     * Get customer profile by ID
     */
    async getCustomerProfile(customerId: string) {
        // Validate customer ID format
        if (!Types.ObjectId.isValid(customerId)) {
            throw new BadRequestException("Invalid customerId format");
        }

        const customer = await this.customerRepository.findOne({
            filter: { _id: new Types.ObjectId(customerId) },
            select: '+profilePhoto'
        });

        if (!customer) {
            throw new NotFoundException("Customer not found");
        }

        return customer;
    }

    /**
     * Update customer profile
     */
    async updateCustomerProfile(customerId: string, dto: UpdateCustomerDto) {
        // Validate customer ID format
        if (!Types.ObjectId.isValid(customerId)) {
            throw new BadRequestException("Invalid customerId format");
        }

        // Check if customer exists
        const customer = await this.customerRepository.findOne({
            filter: { _id: new Types.ObjectId(customerId) }
        });

        if (!customer) {
            throw new NotFoundException("Customer not found");
        }

        // If phone is being updated, check if it's already taken
        if (dto.phone && dto.phone !== customer.phone) {
            const existingPhone = await this.customerRepository.findByPhone(dto.phone);
            if (existingPhone) {
                throw new BadRequestException("Phone number already registered");
            }
        }

        // Update customer
        const updatedCustomer = await this.customerRepository.findOneAndUpdate({
            filter: { _id: new Types.ObjectId(customerId) },
            update: {
                ...(dto.firstName && { firstName: dto.firstName }),
                ...(dto.lastName && { lastName: dto.lastName }),
                ...(dto.phone && { phone: dto.phone.trim() }),
                ...(dto.address && { address: dto.address }),
            },
            options: { new: true }
        });

        if (!updatedCustomer) {
            throw new BadRequestException("Failed to update customer profile");
        }

        return updatedCustomer;
    }

    /**
     * Update customer password
     */
    async updatePassword(customerId: string, dto: UpdatePasswordDto) {
        // Validate customer ID format
        if (!Types.ObjectId.isValid(customerId)) {
            throw new BadRequestException("Invalid customerId format");
        }

        // Find customer with password
        const customer = await this.customerRepository.findByIdWithPassword(new Types.ObjectId(customerId));

        if (!customer) {
            throw new NotFoundException("Customer not found");
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(dto.currentPassword, customer.password);

        if (!isPasswordValid) {
            throw new BadRequestException("Current password is incorrect");
        }

        // Update password (will be hashed by pre-save hook)
        customer.password = dto.newPassword;
        await customer.save();

        return { message: "Password updated successfully" };
    }

    // ─── AI Verification Photo Methods ───────────────────────────

    /**
     * Process a verification photo submitted by an authenticated customer.
     * Compares the live photo against the stored profile photo using
     * server-side face recognition. Returns match result or forces retake.
     */
    async processVerificationPhoto(
        customerId: string,
        photoDataUri: string,
    ): Promise<{
        status: string;
        matched: boolean;
        distance?: number;
        personKey: string;
    }> {
        if (!Types.ObjectId.isValid(customerId)) {
            throw new BadRequestException("Invalid customerId format");
        }

        if (!photoDataUri) {
            throw new BadRequestException("verification photo is required");
        }

        const customer = await this.customerRepository.findOneAndUpdate({
            filter: { _id: new Types.ObjectId(customerId) },
            update: { loginPhotoValue: photoDataUri },
            options: { new: true },
        });

        if (!customer) {
            throw new NotFoundException("Customer not found");
        }

        // Fetch profile photo (select: false in schema — must explicitly select)
        const profileCustomer = await this.customerRepository.findOne({
            filter: { _id: new Types.ObjectId(customerId) },
            select: "+profilePhotoKey",
        });

        if (!profileCustomer?.profilePhotoKey) {
            throw new BadRequestException(
                "No profile photo on file. Please contact support.",
            );
        }

        // Run face comparison (lazy-loaded — first call loads tfjs models)
        const { compareFaces } = await import("../utils/face-comparer");
        const comparison = await compareFaces(
            profileCustomer.profilePhotoKey,
            photoDataUri,
        );

        const personKey = `${customer.firstName}_${customer.lastName}_${customer._id.toString()}`;

        // Still forward to AI socket for future external AI integration
        sendPersonImagesToAI({
            personKey,
            images: [photoDataUri],
        });

        if (comparison.status === "verified") {
            return {
                status: "verified",
                matched: true,
                distance: comparison.distance,
                personKey,
            };
        }

        if (comparison.status === "face_mismatch") {
            return {
                status: "face_mismatch",
                matched: false,
                distance: comparison.distance,
                personKey,
            };
        }

        // no_face_detected / model_load_failed / processing_error
        return {
            status: comparison.status,
            matched: false,
            personKey,
        };
    }
}

export default new CustomerService();