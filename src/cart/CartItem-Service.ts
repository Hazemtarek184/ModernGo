import { Types } from "mongoose";
import { CartItemModel } from "./CartItem-Module";
import { CartItemRepository } from "../DB/repository/CartItem-Repository";
import { BadRequestException } from "../utils/error.response";
import type { ICartActionPayload, ICartItem, ICartUpdatedPayload } from "../types/CartItem-Interface";

class CartItemService {
    private cartItemRepository = new CartItemRepository(CartItemModel as any);

    constructor() { }

    // ─── Core Socket Handler ─────────────────────────────────────────

    /**
     * Process a pick / release action from the AI vision system.
     * Returns the updated payload to broadcast to the mobile client.
     */
    async handleCartAction(payload: ICartActionPayload): Promise<ICartUpdatedPayload> {
        const { customerId, storeProductId, action } = payload;

        // Validate ObjectId formats
        if (!Types.ObjectId.isValid(customerId)) {
            throw new BadRequestException("Invalid customerId format");
        }
        if (!Types.ObjectId.isValid(storeProductId)) {
            throw new BadRequestException("Invalid storeProductId format");
        }

        const customerOid = new Types.ObjectId(customerId);
        const productOid = new Types.ObjectId(storeProductId);

        let updatedItem: ICartItem | null = null;

        if (action === "pick") {
            updatedItem = await this.handlePick(customerOid, productOid);
        } else if (action === "release") {
            updatedItem = await this.handleRelease(customerOid, productOid);
        } else {
            throw new BadRequestException(`Unknown cart action: ${action}`);
        }

        // Always return the full cart so the mobile app can reconcile state
        const cart = await this.getCustomerCart(customerId);

        return { action, item: updatedItem, cart };
    }

    // ─── Pick: add or increment ──────────────────────────────────────

    private async handlePick(
        customerId: Types.ObjectId,
        storeProductId: Types.ObjectId,
    ): Promise<ICartItem> {
        // Upsert: create with qty 1 if new, increment qty if exists
        const item = await this.cartItemRepository.findOneAndUpdate({
            filter: { customerId, storeProductId } as any,
            update: { $inc: { quantity: 1 }, $setOnInsert: { customerId, storeProductId } } as any,
            options: { new: true, upsert: true },
        });

        if (!item) {
            throw new BadRequestException("Failed to add item to cart");
        }

        return item as unknown as ICartItem;
    }

    // ─── Release: decrement or remove ────────────────────────────────

    private async handleRelease(
        customerId: Types.ObjectId,
        storeProductId: Types.ObjectId,
    ): Promise<ICartItem | null> {
        const existing = await this.cartItemRepository.findByCustomerAndProduct(
            customerId,
            storeProductId,
        );

        if (!existing) {
            // Item not in cart — nothing to release
            return null;
        }

        const currentQty = (existing as any).quantity as number;

        if (currentQty <= 1) {
            // Remove entirely
            await this.cartItemRepository.findOneAndDelete({
                filter: { customerId, storeProductId } as any,
            });
            return null;
        }

        // Decrement
        const updated = await this.cartItemRepository.findOneAndUpdate({
            filter: { customerId, storeProductId } as any,
            update: { $inc: { quantity: -1 } } as any,
            options: { new: true },
        });

        return updated as unknown as ICartItem;
    }

    // ─── Read helpers ────────────────────────────────────────────────

    /** Get the full cart for a customer (populated with product data) */
    async getCustomerCart(customerId: string): Promise<ICartItem[]> {
        if (!Types.ObjectId.isValid(customerId)) {
            throw new BadRequestException("Invalid customerId format");
        }

        const items = await this.cartItemRepository.findByCustomerId(
            new Types.ObjectId(customerId),
        );

        return items as unknown as ICartItem[];
    }

    /** Clear every item in a customer's cart */
    async clearCustomerCart(customerId: string): Promise<void> {
        if (!Types.ObjectId.isValid(customerId)) {
            throw new BadRequestException("Invalid customerId format");
        }

        await this.cartItemRepository.deleteMany({
            filter: { customerId: new Types.ObjectId(customerId) } as any,
        });
    }
}

export default new CartItemService();