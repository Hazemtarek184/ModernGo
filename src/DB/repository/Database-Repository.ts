import {
    CreateOptions,
    DeleteResult,
    FlattenMaps,
    HydratedDocument,
    Model,
    // MongooseUpdateQueryOptions,
    PopulateOptions,
    ProjectionType,
    QueryOptions,
    Types,
    UpdateQuery,
    UpdateWriteOpResult,
    // UpdateWriteOpResult,
    // RootFilterQuery,

} from "mongoose";
type ModelFilter<T> = Parameters<Model<T>["find"]>[0];

export type Lean<T> = FlattenMaps<T>;

export abstract class DatabaseRepository<TRawDocument, TDocument = HydratedDocument<TRawDocument>> {
    constructor(protected model: Model<TDocument>) { }


    async create({
        data,
        options,
    }: {
        data: Partial<TRawDocument>[] | any;
        options?: CreateOptions | undefined;
    }): Promise<TDocument[]> {
        return await this.model.create(data, options) || [];
    }

    async findOne({
        filter,
        select,
        options,
    }: {
        filter?: ModelFilter<TRawDocument>;
        select?: ProjectionType<TRawDocument> | null;
        options?: QueryOptions<TDocument> | null;

    }): Promise<
        // | Lean<TDocument>
        HydratedDocument<TDocument>
        | null
    > {

        const doc = this.model.findOne(filter).select(select || "")
        if (options?.lean) {
            doc.lean(options.lean);
        }

        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[]);
        }
        return await doc.exec();
    }


    async find({
        filter,
        select,
        options,
    }: {
        filter: ModelFilter<TRawDocument>;
        select?: ProjectionType<TRawDocument> | undefined;
        options?: QueryOptions<TDocument> | undefined
    }): Promise<TDocument[] | [] | Lean<TDocument>[]> {
        const doc = this.model.find(filter || {}).select(select || ' ');

        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[])
        }

        if (options?.skip) {
            doc.skip(options.skip)
        }
        if (options?.lean) {
            doc.lean(options.lean)
        }
        if (options?.limit) {
            doc.limit(options.limit)
        }
        return await doc.exec();
    }


    async updateOne({
        filter,
        update,
        options

    }:
        {
            filter: ModelFilter<TRawDocument> | any,
            update: UpdateQuery<TDocument>,
            options?:QueryOptions<TDocument> | any

        }): Promise<UpdateWriteOpResult> {
    
        return this.model.updateOne(
            filter,
            { ...update, $inc: { __v: 1 } },
            options
        );
    }



    async findByIdAndUpdate({
        id,
        update,
        options = { new: true },

    }: {
        id: Types.ObjectId;
        update?: UpdateQuery<TDocument>,
        options?: QueryOptions<TDocument>,
    }): Promise<TDocument | Lean<TDocument> | null> {
        return await this.model.findByIdAndUpdate(
            id,
            { ...update, $inc: { __v: 1 } },
            options,
        )

    }


    async findOneAndUpdate({
        filter,
        update,
        options = { new: true },


    }: {
        filter?: ModelFilter<TRawDocument>;
        update?: UpdateQuery<TDocument> | null;
        options?: QueryOptions<TDocument> | null;
    }): Promise<TDocument | Lean<TDocument> | null> {


        if (Array.isArray(update)) {
            update.push({
                $set: {
                    __v: { $add: [`$__v`, 1] }
                },
            });
            return await this.model.findOneAndUpdate(filter || {}, update, options)
        }
        return this.model.findOneAndUpdate(
            filter || {},
            { ...update, $inc: { __v: 1 } },
            options,
        );
    }


    async findOneAndDelete({
        filter,

    }: {
        filter?: ModelFilter<TRawDocument>;

    }): Promise<TDocument | Lean<TDocument> | null> {
        return this.model.findOneAndDelete(
            filter || {},
            { $inc: { __v: 1 } },
        );
    }




    async deleteOne({
        filter,


    }:
        {
            filter: ModelFilter<TRawDocument>,


        }): Promise<DeleteResult> {
        return this.model.deleteOne(
            filter,
        );
    }


    async deleteMany({
        filter,


    }:
        {
            filter: ModelFilter<TRawDocument>,


        }): Promise<DeleteResult> {
        return this.model.deleteMany(
            filter,
        );
    }

}