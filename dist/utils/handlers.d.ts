import { Response } from "express";
export declare const isValidObjectId: (id: string) => boolean;
export declare const areValidObjectIds: (ids: string[]) => boolean;
export declare const sendErrorResponse: (res: Response, statusCode: number, message: string) => void;
export declare const sendSuccessResponse: <T>(res: Response, statusCode: number, data?: T, message?: string) => void;
export declare const isValidCoordinates: (coordinates: number[]) => boolean;
export declare const isValidPhoneNumber: (phone: string) => boolean;
export declare const sanitizeString: (str: string) => string;
export declare const validateRequiredFields: (fields: Record<string, any>, requiredFields: string[]) => string | null;
export declare const calculateDistance: (coord1: [number, number], coord2: [number, number]) => number;
export declare const formatDistance: (meters: number) => string;
export declare const isValidCategoryArray: (categories: any) => boolean;
export declare const parseNumericQuery: (value: any, defaultValue: number, min?: number, max?: number) => number;
//# sourceMappingURL=handlers.d.ts.map