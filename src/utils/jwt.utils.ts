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
 * Get JWT secret from environment, throws if not set
 */
const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    return secret;
};

/**
 * Generate JWT access token for an authenticated entity
 */
export const generateToken = (entityId: Types.ObjectId, email: string, role: TokenRole): string => {
    const payload: TokenPayload = {
        entityId: entityId.toString(),
        email,
        role
    };

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(payload, getJwtSecret(), { expiresIn } as jwt.SignOptions);
};

/**
 * Verify JWT token and return payload
 */
export const verifyToken = (token: string): TokenPayload => {
    try {
        const decoded = jwt.verify(token, getJwtSecret()) as TokenPayload;
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};
