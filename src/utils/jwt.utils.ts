import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

// Token payload interface
export interface TokenPayload {
    customerId: string;
    email: string;
}

/**
 * Generate JWT access token for customer
 */
export const generateToken = (customerId: Types.ObjectId, email: string): string => {
    const payload: TokenPayload = {
        customerId: customerId.toString(),
        email
    };

    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

/**
 * Verify JWT token and return payload
 */
export const verifyToken = (token: string): TokenPayload => {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    try {
        const decoded = jwt.verify(token, secret) as TokenPayload;
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};
