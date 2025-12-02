"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Customer_Module_1 = require("./Customer-Module");
const Customer_Repository_1 = require("../DB/repository/Customer-Repository");
const error_response_1 = require("../utils/error.response");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_utils_1 = require("../utils/jwt.utils");
class CustomerService {
    customerRepository = new Customer_Repository_1.CustomerRepository(Customer_Module_1.CustomerModel);
    constructor() { }
    async registerCustomer(dto) {
        const existingEmail = await this.customerRepository.findByEmail(dto.email);
        if (existingEmail) {
            throw new error_response_1.BadRequestException("Email already registered");
        }
        const existingPhone = await this.customerRepository.findByPhone(dto.phone);
        if (existingPhone) {
            throw new error_response_1.BadRequestException("Phone number already registered");
        }
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
            throw new error_response_1.BadRequestException("Failed to create customer account");
        }
        const customerObject = customer.toObject();
        const { password, ...customerWithoutPassword } = customerObject;
        const token = (0, jwt_utils_1.generateToken)(customer._id, customer.email);
        return {
            customer: customerWithoutPassword,
            token
        };
    }
    async loginCustomer(dto) {
        const customer = await this.customerRepository.findByEmailWithPassword(dto.email);
        if (!customer) {
            throw new error_response_1.BadRequestException("Invalid email or password");
        }
        const isPasswordValid = await bcrypt_1.default.compare(dto.password, customer.password);
        if (!isPasswordValid) {
            throw new error_response_1.BadRequestException("Invalid email or password");
        }
        const customerObject = customer.toObject();
        const { password, ...customerWithoutPassword } = customerObject;
        const token = (0, jwt_utils_1.generateToken)(customer._id, customer.email);
        return {
            customer: customerWithoutPassword,
            token
        };
    }
    async getCustomerProfile(customerId) {
        if (!mongoose_1.Types.ObjectId.isValid(customerId)) {
            throw new error_response_1.BadRequestException("Invalid customerId format");
        }
        const customer = await this.customerRepository.findOne({
            filter: { _id: new mongoose_1.Types.ObjectId(customerId) }
        });
        if (!customer) {
            throw new error_response_1.NotFoundException("Customer not found");
        }
        return customer;
    }
    async updateCustomerProfile(customerId, dto) {
        if (!mongoose_1.Types.ObjectId.isValid(customerId)) {
            throw new error_response_1.BadRequestException("Invalid customerId format");
        }
        const customer = await this.customerRepository.findOne({
            filter: { _id: new mongoose_1.Types.ObjectId(customerId) }
        });
        if (!customer) {
            throw new error_response_1.NotFoundException("Customer not found");
        }
        if (dto.phone && dto.phone !== customer.phone) {
            const existingPhone = await this.customerRepository.findByPhone(dto.phone);
            if (existingPhone) {
                throw new error_response_1.BadRequestException("Phone number already registered");
            }
        }
        const updatedCustomer = await this.customerRepository.findOneAndUpdate({
            filter: { _id: new mongoose_1.Types.ObjectId(customerId) },
            update: {
                ...(dto.firstName && { firstName: dto.firstName }),
                ...(dto.lastName && { lastName: dto.lastName }),
                ...(dto.phone && { phone: dto.phone.trim() }),
                ...(dto.address && { address: dto.address }),
            },
            options: { new: true }
        });
        if (!updatedCustomer) {
            throw new error_response_1.BadRequestException("Failed to update customer profile");
        }
        return updatedCustomer;
    }
    async updatePassword(customerId, dto) {
        if (!mongoose_1.Types.ObjectId.isValid(customerId)) {
            throw new error_response_1.BadRequestException("Invalid customerId format");
        }
        const customer = await this.customerRepository.findByIdWithPassword(new mongoose_1.Types.ObjectId(customerId));
        if (!customer) {
            throw new error_response_1.NotFoundException("Customer not found");
        }
        const isPasswordValid = await bcrypt_1.default.compare(dto.currentPassword, customer.password);
        if (!isPasswordValid) {
            throw new error_response_1.BadRequestException("Current password is incorrect");
        }
        customer.password = dto.newPassword;
        await customer.save();
        return { message: "Password updated successfully" };
    }
}
exports.default = new CustomerService();
//# sourceMappingURL=Customer-Service.js.map