import { Types } from "mongoose";
import { CustomerModel } from "./Customer-Module";
import { CustomerRepository } from "../DB/repository/Customer-Repository";
import { BadRequestException, NotFoundException } from "../utils/error.response";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.utils";

interface RegisterCustomerDto {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
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
    private customerRepository = new CustomerRepository(CustomerModel);

    constructor() { }

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
                address: dto.address,
            }]
        });

        if (!customer) {
            throw new BadRequestException("Failed to create customer account");
        }

        // Return customer without password
        const customerObject = customer.toObject();
        const { password, ...customerWithoutPassword } = customerObject;

        // Generate JWT token
        const token = generateToken(customer._id!, customer.email);

        return {
            customer: customerWithoutPassword,
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
        const token = generateToken(customer._id!, customer.email);

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
            filter: { _id: new Types.ObjectId(customerId) }
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
}

export default new CustomerService();
