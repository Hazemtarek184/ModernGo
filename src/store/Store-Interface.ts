import { ObjectId } from 'mongodb';

interface Location {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
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