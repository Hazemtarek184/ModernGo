"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandling = exports.asyncHandler = exports.ConflictException = exports.ForbiddenException = exports.UnauthorizedException = exports.NotFoundException = exports.BadRequestException = exports.ApplicationException = void 0;
var ApplicationException = /** @class */ (function (_super) {
    __extends(ApplicationException, _super);
    function ApplicationException(message, statusCode, cause) {
        if (statusCode === void 0) { statusCode = 400; }
        var _this = _super.call(this, message, { cause: cause }) || this;
        _this.statusCode = statusCode;
        _this.name = _this.constructor.name;
        Error.captureStackTrace(_this, _this.constructor);
        return _this;
    }
    return ApplicationException;
}(Error));
exports.ApplicationException = ApplicationException;
var BadRequestException = /** @class */ (function (_super) {
    __extends(BadRequestException, _super);
    function BadRequestException(message, cause) {
        return _super.call(this, message, 400, cause) || this;
    }
    return BadRequestException;
}(ApplicationException));
exports.BadRequestException = BadRequestException;
var NotFoundException = /** @class */ (function (_super) {
    __extends(NotFoundException, _super);
    function NotFoundException(message, cause) {
        return _super.call(this, message, 404, cause) || this;
    }
    return NotFoundException;
}(ApplicationException));
exports.NotFoundException = NotFoundException;
var UnauthorizedException = /** @class */ (function (_super) {
    __extends(UnauthorizedException, _super);
    function UnauthorizedException(message, cause) {
        return _super.call(this, message, 401, cause) || this;
    }
    return UnauthorizedException;
}(ApplicationException));
exports.UnauthorizedException = UnauthorizedException;
var ForbiddenException = /** @class */ (function (_super) {
    __extends(ForbiddenException, _super);
    function ForbiddenException(message, cause) {
        return _super.call(this, message, 403, cause) || this;
    }
    return ForbiddenException;
}(ApplicationException));
exports.ForbiddenException = ForbiddenException;
var ConflictException = /** @class */ (function (_super) {
    __extends(ConflictException, _super);
    function ConflictException(message, cause) {
        return _super.call(this, message, 409, cause) || this;
    }
    return ConflictException;
}(ApplicationException));
exports.ConflictException = ConflictException;
/**
 * Wrap async controllers so we don't repeat try/catch.
 *
 * Any error thrown inside the controller will automatically go to:
 * next(error) -> globalErrorHandling
 */
var asyncHandler = function (fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
/** Global error handling middleware */
var globalErrorHandling = function (error, req, res, next) {
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
exports.globalErrorHandling = globalErrorHandling;
