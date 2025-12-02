import { CreateOptions, DeleteResult, FlattenMaps, HydratedDocument, Model, ProjectionType, QueryOptions, Types, UpdateQuery, UpdateWriteOpResult } from "mongoose";
type ModelFilter<T> = Parameters<Model<T>["find"]>[0];
export type Lean<T> = FlattenMaps<T>;
export declare abstract class DatabaseRepository<TRawDocument, TDocument = HydratedDocument<TRawDocument>> {
    protected model: Model<TDocument>;
    constructor(model: Model<TDocument>);
    create({ data, options, }: {
        data: Partial<TRawDocument>[] | any;
        options?: CreateOptions | undefined;
    }): Promise<TDocument[]>;
    findOne({ filter, select, options, }: {
        filter?: ModelFilter<TRawDocument>;
        select?: ProjectionType<TRawDocument> | null;
        options?: QueryOptions<TDocument> | null;
    }): Promise<HydratedDocument<TDocument> | null>;
    find({ filter, select, options, }: {
        filter: ModelFilter<TRawDocument>;
        select?: ProjectionType<TRawDocument> | undefined;
        options?: QueryOptions<TDocument> | undefined;
    }): Promise<TDocument[] | [] | Lean<TDocument>[]>;
    updateOne({ filter, update, options }: {
        filter: ModelFilter<TRawDocument> | any;
        update: UpdateQuery<TDocument>;
        options?: QueryOptions<TDocument> | any;
    }): Promise<UpdateWriteOpResult>;
    findByIdAndUpdate({ id, update, options, }: {
        id: Types.ObjectId;
        update?: UpdateQuery<TDocument>;
        options?: QueryOptions<TDocument>;
    }): Promise<TDocument | Lean<TDocument> | null>;
    findOneAndUpdate({ filter, update, options, }: {
        filter?: ModelFilter<TRawDocument>;
        update?: UpdateQuery<TDocument> | null;
        options?: QueryOptions<TDocument> | null;
    }): Promise<TDocument | Lean<TDocument> | null>;
    findOneAndDelete({ filter, }: {
        filter?: ModelFilter<TRawDocument>;
    }): Promise<TDocument | Lean<TDocument> | null>;
    deleteOne({ filter, }: {
        filter: ModelFilter<TRawDocument>;
    }): Promise<DeleteResult>;
    deleteMany({ filter, }: {
        filter: ModelFilter<TRawDocument>;
    }): Promise<DeleteResult>;
}
export {};
//# sourceMappingURL=Database-Repository.d.ts.map