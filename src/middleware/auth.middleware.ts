import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { UnauthorizedException } from '../utils/error.response';
import { CustomerRepository } from '../DB/repository/Customer-Repository';
import { CustomerModel } from '../customer/Customer-Module';
import { Types } from 'mongoose';

// Extend Express Request to include customer data
declare global {
    namespace Express {
        interface Request {
            customer?: {
                customerId: string;
                email: string;
            };
        }
    }
}

/**
 * Authentication middleware to verify JWT token
 * Protects routes that require customer authentication
 */
export const authenticateCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const payload = verifyToken(token);

        // Verify customer still exists
        const customerRepository = new CustomerRepository(CustomerModel);
        const customer = await customerRepository.findOne({
            filter: { _id: new Types.ObjectId(payload.customerId) }
        });

        if (!customer) {
            throw new UnauthorizedException('Customer no longer exists');
        }

        // Attach customer data to request
        req.customer = {
            customerId: payload.customerId,
            email: payload.email
        };

        next();
    } catch (error: any) {
        if (error instanceof UnauthorizedException) {
            throw error;
        }
        throw new UnauthorizedException('Invalid or expired token');
    }
};

/**
 * Optional authentication middleware
 * Attaches customer if token is valid, but doesn't require it
 */
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = verifyToken(token);

            req.customer = {
                customerId: payload.customerId,
                email: payload.email
            };
        }

        next();
    } catch (error) {
        // Silently fail for optional auth
        next();
    }
};
