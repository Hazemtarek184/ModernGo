import { Types } from "mongoose";

// ─── Database Document ───────────────────────────────────────────────

export interface ICartItem {
    _id?: Types.ObjectId;
    customerId: Types.ObjectId;
    storeProductId: Types.ObjectId;
    quantity: number;
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
