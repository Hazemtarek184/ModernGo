import { Types } from "mongoose";
import { CustomerModel } from "./Customer-Module";
import { CustomerRepository } from "../DB/repository/Customer-Repository";
import { BadRequestException, NotFoundException } from "../utils/error.response";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.utils";

interface RegisterCustomerDto {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    profilePhotoKey: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
}

interface LoginCustomerDto {
    email: string;
    password: string;
}

interface UpdateCustomerDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
}

interface UpdatePasswordDto {
    currentPassword: string;
    newPassword: string;
}

class CustomerService {
    private customerRepository = new CustomerRepository(CustomerModel);

    constructor() { }

    // ✅ update profile photo key
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

    // ✅ get profile photo key (for proxy)
    async getProfilePhotoKey(customerId: string) {
        if (!Types.ObjectId.isValid(customerId)) {
            throw new BadRequestException("Invalid customerId format");
        }

        const customer = await this.customerRepository.findOne({
            filter: { _id: new Types.ObjectId(customerId) }
        });

        if (!customer) {
            throw new NotFoundException("Customer not found");
        }

        if (!customer.profilePhotoKey) {
            throw new NotFoundException("Profile photo not found");
        }

        return customer.profilePhotoKey;
    }

    /**
     * Register a new customer
     */
    async registerCustomer(dto: RegisterCustomerDto) {
        const existingEmail = await this.customerRepository.findByEmail(dto.email);
        if (existingEmail) {
            throw new BadRequestException("Email already registered");
        }

        const existingPhone = await this.customerRepository.findByPhone(dto.phone);
        if (existingPhone) {
            throw new BadRequestException("Phone number already registered");
        }

        const [customer] = await this.customerRepository.create({
            data: [{
                _id: dto._id,
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email.toLowerCase().trim(),
                phone: dto.phone.trim(),
                password: dto.password,
                profilePhotoKey: dto.profilePhotoKey,
                address: dto.address,
            }]
        });

        if (!customer) {
            throw new BadRequestException("Failed to create customer account");
        }

        const customerObject = customer.toObject();
        const { password, ...customerWithoutPassword } = customerObject;

        const token = generateToken(customer._id!, customer.email, 'customer');

        return {
            customer: customerWithoutPassword,
            token
        };
    }

    /**
     * Login customer
     */
    async loginCustomer(dto: LoginCustomerDto) {
        const customer = await this.customerRepository.findByEmailWithPassword(dto.email);

        if (!customer) {
            throw new BadRequestException("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(dto.password, customer.password);

        if (!isPasswordValid) {
            throw new BadRequestException("Invalid email or password");
        }

        const customerObject = customer.toObject();
        const { password, ...customerWithoutPassword } = customerObject;

        const token = generateToken(customer._id!, customer.email, 'customer');

        return {
            customer: customerWithoutPassword,
            token
        };
    }

    /**
     * Get customer profile
     */
    async getCustomerProfile(customerId: string) {
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
     * Update profile
     */
    async updateCustomerProfile(customerId: string, dto: UpdateCustomerDto) {
        if (!Types.ObjectId.isValid(customerId)) {
            throw new BadRequestException("Invalid customerId format");
        }

        const customer = await this.customerRepository.findOne({
            filter: { _id: new Types.ObjectId(customerId) }
        });

        if (!customer) {
            throw new NotFoundException("Customer not found");
        }

        if (dto.phone && dto.phone !== customer.phone) {
            const existingPhone = await this.customerRepository.findByPhone(dto.phone);
            if (existingPhone) {
                throw new BadRequestException("Phone number already registered");
            }
        }

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
     * Update password
     */
    async updatePassword(customerId: string, dto: UpdatePasswordDto) {
        if (!Types.ObjectId.isValid(customerId)) {
            throw new BadRequestException("Invalid customerId format");
        }

        const customer = await this.customerRepository.findByIdWithPassword(new Types.ObjectId(customerId));

        if (!customer) {
            throw new NotFoundException("Customer not found");
        }

        const isPasswordValid = await bcrypt.compare(dto.currentPassword, customer.password);

        if (!isPasswordValid) {
            throw new BadRequestException("Current password is incorrect");
        }

        customer.password = dto.newPassword;
        await customer.save();

        return { message: "Password updated successfully" };
    }
}

export default new CustomerService();