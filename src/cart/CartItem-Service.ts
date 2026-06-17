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
import OrderService from "../order/Order-Service";

type StockSnapshotItem = {
    storeProductId: string;
};

type StockSnapshotPayload = {
    items: StockSnapshotItem[];
};

export type HealthWarning = {
    productName: string;
    severity: "critical" | "severe" | "moderate";
    type: "allergy" | "drug_interaction" | "dietary" | "condition";
    message: string;
};

class CartItemService {
    private cartItemRepository = new CartItemRepository(CartItemModel);

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
        affectedCustomers: string[];
    }> {
        const { items } = payload;

        if (!Array.isArray(items)) {
            throw new BadRequestException("items must be an array");
        }

        const affectedCustomersSet = new Set<string>();

        for (const item of items) {
            if (!Types.ObjectId.isValid(item.storeProductId)) {
                throw new BadRequestException("Invalid storeProductId format");
            }

            // Find all real customer IDs who have this product in their cart BEFORE releasing
            const customerIds = await this.getCustomersWithProduct(item.storeProductId);
            for (const id of customerIds) {
                affectedCustomersSet.add(id);
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
            affectedCustomers: Array.from(affectedCustomersSet),
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

            const cartItems = await this.getCustomerCart(personKey);
            await this.createOrderFromCart(personKey, cartItems);
            await this.clearCustomerCart(personKey);

            return {
                status: "customer_left",
                customerId: personKey,
            };
        }

        const phantomCart = await this.getPhantomCart(personKey);
        await this.createOrderFromCart(undefined, phantomCart);
        await PhantomCartModel.deleteMany({ phantomKey: personKey });

        console.log("[Cart] Phantom person left store, phantom cart removed:", {
            phantomKey: personKey,
        });

        return {
            status: "phantom_left",
        };
    }

    private async createOrderFromCart(customerId: string | undefined, cartItems: { storeProductId: any; quantity: number }[]) {
        if (!cartItems || cartItems.length === 0) return null;

        // Group cart items by their storeId
        const itemsByStore: Record<string, any[]> = {};

        for (const item of cartItems) {
            const spId = typeof item.storeProductId === 'object' && item.storeProductId._id 
                ? item.storeProductId._id 
                : item.storeProductId;
                
            const storeProduct = await StoreProductModel.findById(spId).lean();
            if (!storeProduct) continue;

            const storeIdStr = storeProduct.storeId.toString();
            if (!itemsByStore[storeIdStr]) {
                itemsByStore[storeIdStr] = [];
            }

            const price = storeProduct.price || 0;
            itemsByStore[storeIdStr].push({
                storeProductId: storeProduct._id,
                quantity: item.quantity,
                price: price
            });
        }

        const createdOrders: any[] = [];

        for (const [storeIdStr, orderItems] of Object.entries(itemsByStore)) {
            if (orderItems.length === 0) continue;

            const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const orderPayload: any = {
                storeId: new Types.ObjectId(storeIdStr),
                items: orderItems,
                totalAmount: parseFloat(totalAmount.toFixed(2))
            };

            if (customerId) {
                orderPayload.customerId = new Types.ObjectId(customerId);
            }

            const order = await OrderService.createOrder(orderPayload);
            createdOrders.push(order);
        }

        return createdOrders.length > 0 ? createdOrders[0] : null;
    }

    // Public version for the manual checkout REST endpoint.
    async createOrderFromCartPublic(customerId: string, cartItems: { storeProductId: any; quantity: number }[]) {
        return this.createOrderFromCart(customerId, cartItems);
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

        // Verify the store product exists in database to prevent cart corruption
        const storeProduct = await StoreProductModel.findById(productOid);
        if (!storeProduct) {
            throw new NotFoundException(`Store product with ID ${storeProductId} not found. Ensure you are passing a StoreProduct ID and not a general Product ID.`);
        }

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

    // Find all real customer IDs who currently have a given storeProduct in their cart.
    // Used to snapshot ownership before a phantom pick removes the item from real carts,
    // so the socket server can notify affected customers afterward.
    async getCustomersWithProduct(storeProductId: string): Promise<string[]> {
        if (!Types.ObjectId.isValid(storeProductId)) {
            return [];
        }

        const items = await this.cartItemRepository.find({
            filter: {
                storeProductId: new Types.ObjectId(storeProductId),
            } as any,
            select: "customerId",
        });

        return (items as any[]).map((item) => item.customerId.toString());
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
    // Health Warnings via Ollama
    async getHealthWarnings(customerId: string, cartItems: ICartItem[]): Promise<HealthWarning[]> {
        try {
            const healthProfile = await HealthProfileModel.findOne({
                customerId: new Types.ObjectId(customerId),
            }).lean();

            if (!healthProfile) {
                return [];
            }

            // Extract product details from populated cart items
            const products = (cartItems as any[]).map((item) => {
                const sp = item.storeProductId;
                const product = sp?.productId;
                if (!product) return null;
                return {
                    name: product.name,
                    ingredients: product.ingredients ?? [],
                    allergens: product.allergens ?? [],
                    drugInteractions: product.drugInteractions ?? [],
                    warnings: product.warnings ?? [],
                    additives: product.additives ?? [],
                };
            }).filter(Boolean);

            if (products.length === 0) {
                return [];
            }

            const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:8081";

            const prompt = `You are a clinical pharmacist. Check if these grocery items are DANGEROUS for this specific patient.

PATIENT HEALTH PROFILE:
Age: ${healthProfile.age}, Sex: ${healthProfile.sex}
Allergies: ${JSON.stringify(healthProfile.allergies)}
Conditions: ${JSON.stringify(healthProfile.conditions)}
Medications: ${JSON.stringify(healthProfile.medications)}
Dietary Restrictions: ${JSON.stringify(healthProfile.dietaryRestrictions)}
Risk Factors: ${JSON.stringify(healthProfile.riskFactors)}

CART ITEMS:
${JSON.stringify(products, null, 2)}

Respond ONLY with a raw JSON object (no markdown, no code blocks, no explanation).
Format: {"hasProblems":true,"warnings":[{"productName":"exact product name","severity":"critical","type":"allergy","message":"brief warning"}]}
Severity levels: critical, severe, moderate.
Type options: allergy, drug_interaction, dietary, condition.
If no problems: {"hasProblems":false,"warnings":[]}
JSON:`;

            const response = await fetch(`${ollamaUrl}/v1/completions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    stream: false,
                    temperature: 0.1,
                    max_tokens: 800,
                }),
            });

            if (!response.ok) {
                console.error(`[Health] Ollama request failed: ${response.status}`);
                return [];
            }

            const data = await response.json() as any;
            const text: string = data?.choices?.[0]?.text ?? "";

            // Extract JSON safely — handles markdown code blocks if model wraps
            const firstBrace = text.indexOf("{");
            const lastBrace = text.lastIndexOf("}");
            if (firstBrace === -1 || lastBrace === -1) {
                console.error("[Health] No JSON in AI response:", text.slice(0, 200));
                return [];
            }

            const parsed = JSON.parse(text.slice(firstBrace, lastBrace + 1));
            const warnings: HealthWarning[] = Array.isArray(parsed.warnings) ? parsed.warnings : [];

            console.log(`[Health] Warnings for customer ${customerId}:`, warnings.length);
            return warnings;
        } catch (error: any) {
            console.error("[Health] getHealthWarnings error:", error.message);
            return [];
        }
    }
}

export default new CartItemService();