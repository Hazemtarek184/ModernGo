import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

// Supported entity roles for JWT
export type TokenRole = 'customer' | 'store';

// Token payload interface
export interface TokenPayload {
    entityId: string;
    email: string;
    role: TokenRole;
}

/**
 * Generate JWT access token for an authenticated entity
 */
export const generateToken = (entityId: Types.ObjectId, email: string, role: TokenRole): string => {
    const payload: TokenPayload = {
        entityId: entityId.toString(),
        email,
        role
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
