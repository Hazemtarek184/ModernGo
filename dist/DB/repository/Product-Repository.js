"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const Database_Repository_1 = require("./Database-Repository");
class ProductRepository extends Database_Repository_1.DatabaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.ProductRepository = ProductRepository;
//# sourceMappingURL=Product-Repository.js.map