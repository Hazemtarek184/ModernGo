"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseRepository = void 0;
class DatabaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options, }) {
        return await this.model.create(data, options) || [];
    }
    async findOne({ filter, select, options, }) {
        console.log({ filter });
        const doc = this.model.findOne(filter).select(select || "");
        if (options?.lean) {
            doc.lean(options.lean);
        }
        if (options?.populate) {
            doc.populate(options.populate);
        }
        return await doc.exec();
    }
    async find({ filter, select, options, }) {
        const doc = this.model.find(filter || {}).select(select || ' ');
        if (options?.populate) {
            doc.populate(options.populate);
        }
        if (options?.skip) {
            doc.skip(options.skip);
        }
        if (options?.lean) {
            doc.lean(options.lean);
        }
        if (options?.limit) {
            doc.limit(options.limit);
        }
        return await doc.exec();
    }
    async updateOne({ filter, update, options }) {
        return this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async findByIdAndUpdate({ id, update, options = { new: true }, }) {
        return await this.model.findByIdAndUpdate(id, { ...update, $inc: { __v: 1 } }, options);
    }
    async findOneAndUpdate({ filter, update, options = { new: true }, }) {
        if (Array.isArray(update)) {
            update.push({
                $set: {
                    __v: { $add: [`$__v`, 1] }
                },
            });
            return await this.model.findOneAndUpdate(filter || {}, update, options);
        }
        return this.model.findOneAndUpdate(filter || {}, { ...update, $inc: { __v: 1 } }, options);
    }
    async findOneAndDelete({ filter, }) {
        return this.model.findOneAndDelete(filter || {}, { $inc: { __v: 1 } });
    }
    async deleteOne({ filter, }) {
        return this.model.deleteOne(filter);
    }
    async deleteMany({ filter, }) {
        return this.model.deleteMany(filter);
    }
}
exports.DatabaseRepository = DatabaseRepository;
//# sourceMappingURL=database.repository.js.map