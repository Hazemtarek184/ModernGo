import { Types } from "mongoose";
import { CartItemModel } from "./CartItem-Module";
import { CartItemRepository } from "../DB/repository/CartItem-Repository";
import { BadRequestException, NotFoundException } from "../utils/error.response";
import { CustomerModel } from "../customer/Customer-Module";
import { HealthProfileModel } from "../health-profile/HealthProfile-Modul";
import { ProductModel } from "../product/Product-Module";
import type {
    ICartActionPayload,
    ICartItem,
    ICartUpdatedPayload,
} from "../types/CartItem-Interface";
import { StoreProductModel } from "../store-product/StoreProduct-Module";
import { IPhantomCart, PhantomCartModel } from "../phantom-cart/PhantomCart-Module";

type StockSnapshotItem = {
    storeProductId: string;
};

type StockSnapshotPayload = {
    items: StockSnapshotItem[];
};

class CartItemService {
    private cartItemRepository = new CartItemRepository(CartItemModel as any);

    constructor() { }
    // Event 3: Cart Event
    async handleAICartEvent(payload: {
        personKey?: string;
        storeProductId: string;
        action: "pick" | "release";
    }): Promise<{ customerId: string; update: ICartUpdatedPayload } | null> {
        const { personKey, storeProductId, action } = payload;

        if (!Types.ObjectId.isValid(storeProductId)) {
            throw new BadRequestException("Invalid storeProductId format");
        }

        if (action === "release") {
            await this.releaseProductGlobally(new Types.ObjectId(storeProductId));

            console.log("[Cart] Product released globally:", {
                storeProductId,
            });

            return null;
        }

        if (!personKey) {
            throw new BadRequestException("personKey is required");
        }

        let customerExists = null;

        if (Types.ObjectId.isValid(personKey)) {
            customerExists = await CustomerModel.findById(personKey);
        }

        if (!customerExists) {
            await this.handlePhantomCartAction(personKey, storeProductId, "pick");

            console.log("[Cart] Saved item in phantom cart:", {
                phantomKey: personKey,
                storeProductId,
            });

            return null;
        }

        const update = await this.handleCartAction({
            customerId: personKey,
            storeProductId,
            action: "pick",
        } as ICartActionPayload);

        return {
            customerId: personKey,
            update,
        };
    }
    // Event 4: Stock Snapshot
    async handleAIStockSnapshot(payload: StockSnapshotPayload): Promise<{
        handledItems: number;
        items: StockSnapshotItem[];
    }> {
        const { items } = payload;

        if (!Array.isArray(items)) {
            throw new BadRequestException("items must be an array");
        }

        for (const item of items) {
            if (!Types.ObjectId.isValid(item.storeProductId)) {
                throw new BadRequestException("Invalid storeProductId format");
            }

            await this.releaseProductGlobally(
                new Types.ObjectId(item.storeProductId),
            );

            console.log("[Cart] Stock snapshot product on shelf:", {
                storeProductId: item.storeProductId,
            });
        }

        return {
            handledItems: items.length,
            items,
        };
    }
    // Event 5: Person Left / Checkout
    async handleAIPersonLeft(personKey: string): Promise<{
        status: "customer_left" | "phantom_left";
        customerId?: string;
    }> {
        if (!personKey) {
            throw new BadRequestException("personKey is required");
        }

        let customerExists = null;

        if (Types.ObjectId.isValid(personKey)) {
            customerExists = await CustomerModel.findById(personKey);
        }

        if (customerExists) {
            console.log("[Cart] Real customer left store:", {
                customerId: personKey,
            });

            return {
                status: "customer_left",
                customerId: personKey,
            };
        }

        await PhantomCartModel.deleteMany({ phantomKey: personKey });

        console.log("[Cart] Phantom person left store, phantom cart removed:", {
            phantomKey: personKey,
        });

        return {
            status: "phantom_left",
        };
    }

    // Add product to cart then send health profile + product details to AI
    async addProductToCartAndCheckHealth(
        customerId: string,
        storeProductId: string,
    ): Promise<{
        cartUpdate: ICartUpdatedPayload;
        aiHealthCheck: unknown;
    }> {
        if (!Types.ObjectId.isValid(customerId)) {
            throw new BadRequestException("Invalid customerId format");
        }

        if (!Types.ObjectId.isValid(storeProductId)) {
            throw new BadRequestException("Invalid storeProductId format");
        }

        // 1) Add product to real cart
        const cartUpdate = await this.handleCartAction({
            customerId,
            storeProductId,
            action: "pick",
        });

        // 2) Get customer's health profile
        const healthProfile = await HealthProfileModel.findOne({
            customerId: new Types.ObjectId(customerId),
        }).lean();

        if (!healthProfile) {
            throw new NotFoundException("Health profile not found");
        }

        // 3) Get store product
        const storeProduct = await StoreProductModel.findById(
            new Types.ObjectId(storeProductId),
        ).lean();

        if (!storeProduct) {
            throw new NotFoundException("Store product not found");
        }

        const productId = storeProduct.productId;

        if (!productId) {
            throw new NotFoundException("Product id not found in store product");
        }

        // 4) Get product details
        const product = await ProductModel.findById(productId).lean();

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        // 5) Payload sent to AI
        const aiPayload = {
            customerId,
            storeProductId,

            healthProfile: {
                age: healthProfile.age,
                sex: healthProfile.sex,
                weightKg: healthProfile.weightKg,
                heightCm: healthProfile.heightCm,
                pregnant: healthProfile.pregnant,
                allergies: healthProfile.allergies,
                conditions: healthProfile.conditions,
                medications: healthProfile.medications,
                dietaryRestrictions: healthProfile.dietaryRestrictions,
                riskFactors: healthProfile.riskFactors,
            },

            product: {
                productId: product._id,
                name: product.name,
                description: product.description,
                ingredients: product.ingredients,
                nutrients: product.nutrients,
                additives: product.additives,
                allergens: product.allergens,
                drugInteractions: product.drugInteractions,
                warnings: product.warnings,
            },
        };

        const aiBaseUrl = process.env.AI_SERVICE_URL;

        if (!aiBaseUrl) {
            throw new BadRequestException("AI_SERVICE_URL is not configured");
        }

        // 6) Send health profile + product details to AI
        const aiResponse = await fetch(`${aiBaseUrl}/check/product-health`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(aiPayload),
        });

        if (!aiResponse.ok) {
            throw new BadRequestException("AI health check failed");
        }

        const aiHealthCheck = await aiResponse.json();

        return {
            cartUpdate,
            aiHealthCheck,
        };
    }
    // Normal Customer Cart
    async handleCartAction(
        payload: ICartActionPayload,
    ): Promise<ICartUpdatedPayload> {
        const { customerId, storeProductId, action } = payload;

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

        const cart = await this.getCustomerCart(customerId);

        return {
            action,
            item: updatedItem,
            cart,
        };
    }
    // Phantom Cart (persisted in database)
    private async handlePhantomCartAction(
        phantomKey: string,
        storeProductId: string,
        action: "pick" | "release",
    ): Promise<void> {
        if (action === "pick") {
            // Remove product from any real cart (ownership transfer)
            await this.cartItemRepository.deleteMany({
                filter: {
                    storeProductId: new Types.ObjectId(storeProductId),
                } as any,
            });

            // Remove from other phantom carts (ownership transfer)
            await PhantomCartModel.deleteMany({
                storeProductId,
                phantomKey: { $ne: phantomKey },
            });

            // Upsert: one item per phantom person
            await PhantomCartModel.updateOne(
                { phantomKey, storeProductId },
                { $set: { phantomKey, storeProductId, quantity: 1 } },
                { upsert: true },
            );
            return;
        }

        if (action === "release") {
            await PhantomCartModel.deleteOne({ phantomKey, storeProductId });
        }
    }

    // Product Ownership Helpers
    private async releaseProductGlobally(
        storeProductId: Types.ObjectId,
    ): Promise<void> {
        await this.cartItemRepository.deleteMany({
            filter: {
                storeProductId,
            } as any,
        });

        await PhantomCartModel.deleteMany({
            storeProductId: storeProductId.toString(),
        });
    }

    private async removeProductFromAllPhantomCarts(
        storeProductId: string,
    ): Promise<void> {
        await PhantomCartModel.deleteMany({ storeProductId });
    }

    // Pick / Release
    private async handlePick(
        customerId: Types.ObjectId,
        storeProductId: Types.ObjectId,
    ): Promise<ICartItem> {
        await this.cartItemRepository.deleteMany({
            filter: {
                storeProductId,
                customerId: { $ne: customerId },
            } as any,
        });

        await this.removeProductFromAllPhantomCarts(storeProductId.toString());

        const item = await this.cartItemRepository.findOneAndUpdate({
            filter: {
                customerId,
                storeProductId,
            } as any,
            update: {
                $set: {
                    customerId,
                    storeProductId,
                    quantity: 1,
                    isActive: true,
                },
            } as any,
            options: {
                returnDocument: "after",
                upsert: true,
            },
        });

        if (!item) {
            throw new BadRequestException("Failed to add item to cart");
        }

        return item as unknown as ICartItem;
    }

    private async handleRelease(
        customerId: Types.ObjectId,
        storeProductId: Types.ObjectId,
    ): Promise<ICartItem | null> {
        await this.cartItemRepository.findOneAndDelete({
            filter: {
                customerId,
                storeProductId,
            } as any,
        });

        return null;
    }

    // Read
    async getCustomerCart(customerId: string): Promise<ICartItem[]> {
        if (!Types.ObjectId.isValid(customerId)) {
            throw new BadRequestException("Invalid customerId format");
        }

        const items = await this.cartItemRepository.findByCustomerId(
            new Types.ObjectId(customerId),
        );

        return items as unknown as ICartItem[];
    }

    async getPhantomCart(phantomKey: string): Promise<IPhantomCart[]> {
        return await PhantomCartModel.find({ phantomKey }).lean();
    }

    async clearCustomerCart(customerId: string): Promise<void> {
        if (!Types.ObjectId.isValid(customerId)) {
            throw new BadRequestException("Invalid customerId format");
        }

        await this.cartItemRepository.deleteMany({
            filter: {
                customerId: new Types.ObjectId(customerId),
            } as any,
        });
    }
}

export default new CartItemService();