import { ObjectId } from 'mongodb';
interface Location {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
}
export interface Store {
    _id: ObjectId;
    name: string;
    address: string;
    phone: string;
    location: Location;
    categories: string[];
    createdAt: Date;
    updatedAt: Date;
}
export {};
//# sourceMappingURL=Store-Interface.d.ts.map