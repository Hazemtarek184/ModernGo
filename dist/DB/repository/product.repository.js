"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const database_repository_1 = require("./database.repository");
class ProductRepository extends database_repository_1.DatabaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.ProductRepository = ProductRepository;
//# sourceMappingURL=product.repository.js.map