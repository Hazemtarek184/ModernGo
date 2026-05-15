import type { Request, Response, NextFunction } from "express";

export class ApplicationException extends Error {
    constructor(
        message: string,
        public statusCode: number = 400,
        cause?: unknown
    ) {
        super(message, { cause });
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestException extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(message, 400, cause);
    }
}

export class NotFoundException extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(message, 404, cause);
    }
}

export class UnauthorizedException extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(message, 401, cause);
    }
}

export class ForbiddenException extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(message, 403, cause);
    }
}

export class ConflictException extends ApplicationException {
    constructor(message: string, cause?: unknown) {
        super(message, 409, cause);
    }
}

/**
 * Wrap async controllers so we don't repeat try/catch.
 *
 * Any error thrown inside the controller will automatically go to:
 * next(error) -> globalErrorHandling
 */
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/** Global error handling middleware */
export const globalErrorHandling = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Known application errors — safe to expose details
    if (error instanceof ApplicationException) {
        return res.status(error.statusCode).json({
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
            cause: error.cause,
        });
    }

    // Unexpected errors — hide internals in production
    console.error("UNHANDLED ERROR:", error);

    return res.status(500).json({
        message: "something went wrong",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
};