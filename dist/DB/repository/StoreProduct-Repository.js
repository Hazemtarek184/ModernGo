"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreProductRepository = void 0;
const Database_Repository_1 = require("./Database-Repository");
class StoreProductRepository extends Database_Repository_1.DatabaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.StoreProductRepository = StoreProductRepository;
//# sourceMappingURL=StoreProduct-Repository.js.map