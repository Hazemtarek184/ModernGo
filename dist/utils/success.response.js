"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = void 0;
const successResponse = ({ res, message = "Done", statuscode = 200, data, }) => {
    return res.status(statuscode).json({ message, statuscode, data });
};
exports.successResponse = successResponse;
//# sourceMappingURL=success.response.js.map