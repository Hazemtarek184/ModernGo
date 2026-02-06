import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { UnauthorizedException } from '../utils/error.response';
import { CustomerRepository } from '../DB/repository/Customer-Repository';
import { StoreRepository } from '../DB/repository/Store-Repository';
import { CustomerModel } from '../customer/Customer-Module';
import { StoreModel } from '../store/Store-Module';
import { Types } from 'mongoose';

// Extend Express Request to include customer and store data
declare global {
    namespace Express {
        interface Request {
            customer?: {
                customerId: string;
                email: string;
            };
            store?: {
                storeId: string;
                email: string;
            };
        }
    }
}

/**
 * Authentication middleware to verify JWT token for customers
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

        // Verify role is customer
        if (payload.role !== 'customer') {
            throw new UnauthorizedException('Invalid token role');
        }

        // Verify customer still exists
        const customerRepository = new CustomerRepository(CustomerModel);
        const customer = await customerRepository.findOne({
            filter: { _id: new Types.ObjectId(payload.entityId) }
        });

        if (!customer) {
            throw new UnauthorizedException('Customer no longer exists');
        }

        // Attach customer data to request
        req.customer = {
            customerId: payload.entityId,
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
 * Authentication middleware to verify JWT token for stores
 * Protects routes that require store authentication
 */
export const authenticateStore = async (
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

        // Verify role is store
        if (payload.role !== 'store') {
            throw new UnauthorizedException('Invalid token role');
        }

        // Verify store still exists
        const storeRepository = new StoreRepository(StoreModel);
        const store = await storeRepository.findOne({
            filter: { _id: new Types.ObjectId(payload.entityId) }
        });

        if (!store) {
            throw new UnauthorizedException('Store no longer exists');
        }

        // Attach store data to request
        req.store = {
            storeId: payload.entityId,
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
 * Attaches customer or store if token is valid, but doesn't require it
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

            if (payload.role === 'customer') {
                req.customer = {
                    customerId: payload.entityId,
                    email: payload.email
                };
            } else if (payload.role === 'store') {
                req.store = {
                    storeId: payload.entityId,
                    email: payload.email
                };
            }
        }

        next();
    } catch (error) {
        // Silently fail for optional auth
        next();
    }
};
