import {
    CreateOptions,
    DeleteResult,
    FlattenMaps,
    HydratedDocument,
    Model,
    PopulateOptions,
    ProjectionType,
    QueryFilter,
    QueryOptions,
    Types,
    UpdateQuery,
    UpdateWriteOpResult,
} from "mongoose";

type ModelFilter<T> = QueryFilter<T>;

export type { ModelFilter };

export type Lean<T> = FlattenMaps<T>;

export abstract class DatabaseRepository<TRawDocument, TDocument = HydratedDocument<TRawDocument>> {
    constructor(protected model: Model<TRawDocument>) { }


    async create({
        data,
        options,
    }: {
        data: Partial<TRawDocument>[] | any;
        options?: CreateOptions | undefined;
    }): Promise<TDocument[]> {
        return (await this.model.create(data, options) || []) as TDocument[];
    }

    async findOne({
        filter,
        select,
        options,
    }: {
        filter?: ModelFilter<TRawDocument>;
        select?: ProjectionType<TRawDocument> | null;
        options?: QueryOptions<TRawDocument> | null;

    }): Promise<TDocument | null> {

        const doc = this.model.findOne(filter).select(select || "")
        if (options?.lean) {
            doc.lean(options.lean);
        }

        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[]);
        }
        return await doc.exec() as TDocument | null;
    }


    async find({
        filter,
        select,
        options,
    }: {
        filter: ModelFilter<TRawDocument>;
        select?: ProjectionType<TRawDocument> | undefined;
        options?: QueryOptions<TRawDocument> | undefined
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
        return await doc.exec() as TDocument[] | Lean<TDocument>[];
    }


    async updateOne({
        filter,
        update,
        options

    }:
        {
            filter: ModelFilter<TRawDocument>,
            update: UpdateQuery<TRawDocument>,
            options?: NonNullable<Parameters<Model<TRawDocument>['updateOne']>[2]>

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
        options = { returnDocument: "after" },

    }: {
        id: Types.ObjectId;
        update?: UpdateQuery<TRawDocument>,
        options?: QueryOptions<TRawDocument>,
    }): Promise<TDocument | Lean<TDocument> | null> {
        return await this.model.findByIdAndUpdate(
            id,
            { ...update, $inc: { __v: 1 } },
            options,
        ) as TDocument | Lean<TDocument> | null;
    }


    async findOneAndUpdate({
        filter,
        update,
        options = { returnDocument: "after" },


    }: {
        filter?: ModelFilter<TRawDocument>;
        update?: UpdateQuery<TRawDocument> | null;
        options?: QueryOptions<TRawDocument> | null;
    }): Promise<TDocument | Lean<TDocument> | null> {


        if (Array.isArray(update)) {
            update.push({
                $set: {
                    __v: { $add: [`$__v`, 1] }
                },
            });
            return await this.model.findOneAndUpdate(filter || {}, update, options) as TDocument | Lean<TDocument> | null;
        }
        return this.model.findOneAndUpdate(
            filter || {},
            { ...update, $inc: { __v: 1 } },
            options,
        ) as Promise<TDocument | Lean<TDocument> | null>;
    }


    async findOneAndDelete({
        filter,

    }: {
        filter?: ModelFilter<TRawDocument>;

    }): Promise<TDocument | Lean<TDocument> | null> {
        return this.model.findOneAndDelete(
            filter || {},
            { $inc: { __v: 1 } },
        ) as Promise<TDocument | Lean<TDocument> | null>;
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