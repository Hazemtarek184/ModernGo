"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config.js");
const body_parser_1 = __importDefault(require("body-parser"));
const Connection_1 = __importDefault(require("./DB/Connection"));
const Store_Router_1 = __importDefault(require("./store/Store-Router"));
const error_response_1 = require("./utils/error.response");
const product_router_1 = __importDefault(require("./product/product.router"));
const bootstrap = async () => {
    const app = (0, express_1.default)();
    const PORT = process.env.PORT || 3000;
    await (0, Connection_1.default)();
    app.use(express_1.default.json());
    app.use(body_parser_1.default.urlencoded({ extended: true }));
    app.use(body_parser_1.default.json());
    app.get("/", (req, res) => {
        res.send("Welcome to the API");
    });
    app.use("/api/", Store_Router_1.default);
    app.use("/product", product_router_1.default);
    app.use("{/*dummy}", (req, res) => {
        res.status(400).json({ message: "Invalid application routing plz check the method and url ❌" });
    });
    app.use(error_response_1.globalErrorHandling);
    if (process.env.NODE_ENV !== 'production') {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} 🚀`);
        });
    }
};
exports.default = bootstrap;
//# sourceMappingURL=app.js.map