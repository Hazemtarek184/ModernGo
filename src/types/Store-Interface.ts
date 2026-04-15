import { Types } from 'mongoose';

export interface ILocation {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
}

export interface IStore {
    _id?: Types.ObjectId;

    name: string;
    email: string;
    password: string;
    address: string;
    phone: string;
    location: ILocation;
    categories: string[];
    profilePhoto?: string;

    createdAt?: Date;
    updatedAt?: Date;
}

// Interface for Store document instance methods
export interface IStoreMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}
