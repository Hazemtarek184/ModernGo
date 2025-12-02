import { Types } from 'mongoose';
export interface TokenPayload {
    customerId: string;
    email: string;
}
export declare const generateToken: (customerId: Types.ObjectId, email: string) => string;
export declare const verifyToken: (token: string) => TokenPayload;
//# sourceMappingURL=jwt.utils.d.ts.map