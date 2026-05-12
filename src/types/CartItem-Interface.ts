import { Types } from "mongoose";

export interface ICartItem {
    customerId: Types.ObjectId;
    storeProductId: Types.ObjectId | any;
    quantity: number;
    isActive: boolean;
    totalPrice?: number;
    addedAt?: Date;
    updatedAt?: Date;
}

// ─── Socket Event Payloads ───────────────────────────────────────────

/** Payload emitted by the AI vision system on the `/ai` namespace */
export interface ICartActionPayload {
    customerId: string;
    storeProductId: string;
    action: "pick" | "release";
}

/** Payload emitted to the Flutter app on the `/mobile` namespace */
export interface ICartUpdatedPayload {
    action: "pick" | "release";
    item: ICartItem | null;
    cart: ICartItem[];
}