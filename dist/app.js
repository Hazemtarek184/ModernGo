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
const Product_Router_1 = __importDefault(require("./product/Product-Router"));
const StoreProduct_Router_1 = __importDefault(require("./store-product/StoreProduct-Router"));
const Customer_Router_1 = __importDefault(require("./customer/Customer-Router"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
(0, Connection_1.default)();
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: "API is running! 🚀" });
});
app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: "Server is healthy!" });
});
app.use("/api/stores", Store_Router_1.default);
app.use("/api/products", Product_Router_1.default);
app.use("/api/customers", Customer_Router_1.default);
app.use("/api", StoreProduct_Router_1.default);
app.use("{/*dummy}", (req, res) => {
    res.status(400).json({ message: "Invalid application routing please check the method and url ❌" });
});
app.use(error_response_1.globalErrorHandling);
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} 🚀`);
    });
}
exports.default = app;
//# sourceMappingURL=app.js.map