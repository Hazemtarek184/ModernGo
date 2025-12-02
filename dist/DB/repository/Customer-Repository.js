"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRepository = void 0;
const Database_Repository_1 = require("./Database-Repository");
class CustomerRepository extends Database_Repository_1.DatabaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
    async findByEmail(email) {
        return await this.findOne({
            filter: { email: email.toLowerCase().trim() }
        });
    }
    async findByEmailWithPassword(email) {
        return await this.model.findOne({ email: email.toLowerCase().trim() }).select('+password').exec();
    }
    async findByPhone(phone) {
        return await this.findOne({
            filter: { phone: phone.trim() }
        });
    }
    async findByIdWithPassword(id) {
        return await this.model.findById(id).select('+password').exec();
    }
}
exports.CustomerRepository = CustomerRepository;
//# sourceMappingURL=Customer-Repository.js.map