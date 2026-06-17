import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { authenticateAiSocket, authenticateMobileSocket } from "./Socket-Auth";
import CartItemService from "../cart/CartItem-Service";
import { CustomerModel } from "../customer/Customer-Module";
import { StoreProductModel } from "../store-product/StoreProduct-Module";
import { ProductModel } from "../product/Product-Module";
import { Types } from "mongoose";

let aiNamespace: ReturnType<Server["of"]> | null = null;
let aiConnectedCount = 0;
const pendingPersonImages: string[] = [];

type PersonImagesPayload = {
    personKey: string;
    images: string[];
};

type CartEventPayload = {
    personKey?: string;
    storeProductId: string;
    action: "pick" | "release";
};

type StockSnapshotItem = {
    storeProductId: string;
};

type StockSnapshotPayload = {
    items: StockSnapshotItem[];
};

type PersonLeftPayload = {
    personKey: string;
};

// Backend -> AI
// Event type 2:
// Send customer/person images to AI
// Message format:
// 2{"personKey":"...","images":["base64..."]}
export const sendPersonImagesToAI = (payload: PersonImagesPayload): void => {
    const message = `2${JSON.stringify(payload)}`;

    if (!aiNamespace || aiConnectedCount === 0) {
        pendingPersonImages.push(message);
        console.log(`[Socket.IO] No AI client connected — queued person_images for "${payload.personKey}" (queue size: ${pendingPersonImages.length})`);
        return;
    }

    aiNamespace.emit("backend:person_images", message);
};

// Helper:
// Parse messages like:
// 3{"personKey":"...","storeProductId":"...","action":"pick"}
// 3{"storeProductId":"...","action":"release"}
// 4{"items":[{"storeProductId":"..."}]}
// 5{"personKey":"..."}
const parseTypedMessage = <T>(data: unknown, expectedEventType: string): T => {
    if (typeof data !== "string") {
        return data as T;
    }

    if (!data.startsWith(expectedEventType)) {
        throw new Error(`Invalid event type. Expected ${expectedEventType}`);
    }

    const jsonPart = data.slice(expectedEventType.length);

    return JSON.parse(jsonPart) as T;
};

export function initSocketServer(httpServer: HttpServer): Server {
    const io = new Server(httpServer, {
        cors: {
            origin:
                process.env.NODE_ENV === "production"
                    ? [process.env.FRONTEND_URL || "https://your-app.com"]
                    : "*",
            methods: ["GET", "POST"],
            credentials: true,
        },

        pingInterval: 25_000,
        pingTimeout: 20_000,
    });

    // ─────────────────────────────────────────────
    // AI namespace
    // ─────────────────────────────────────────────

    aiNamespace = io.of("/ai");
    aiNamespace.use(authenticateAiSocket);

    aiNamespace.on("connection", (socket: Socket) => {
        aiConnectedCount++;
        console.log(`[AI] Connected: ${socket.id} (active clients: ${aiConnectedCount})`);

        // Flush any queued person_images to the newly connected AI client
        if (pendingPersonImages.length > 0) {
            console.log(`[AI] Flushing ${pendingPersonImages.length} queued person_images to ${socket.id}`);
            for (const message of pendingPersonImages) {
                socket.emit("backend:person_images", message);
            }
            pendingPersonImages.length = 0;
        }


        // ─────────────────────────────────────────
        // Event type 1: alive ping
        //
        // AI sends:
        // 1{0}
        //
        // Backend responds:
        // 1{1}
        // ─────────────────────────────────────────

        socket.on("ai:alive", (data, ack) => {
            console.log("[AI] alive:", data);

            const response = "1{1}";

            if (typeof ack === "function") {
                ack(response);
                return;
            }

            socket.emit("backend:alive_ack", response);
        });

        // ─────────────────────────────────────────
        // Event type 3: cart event
        //
        // PICK:
        // AI sends:
        // 3{"personKey":"uuid","storeProductId":"...","action":"pick"}
        //
        // RELEASE:
        // AI sends:
        // 3{"storeProductId":"...","action":"release"}
        //
        // pick:
        // - needs personKey
        // - real customer -> real cart
        // - unknown person -> phantom cart
        //
        // release:
        // - does not need personKey
        // - removes product from real carts and phantom carts
        // ─────────────────────────────────────────

        socket.on("ai:cart_event", async (data) => {
            try {
                console.log("[AI] cart event raw:", data);

                const parsedPayload = parseTypedMessage<CartEventPayload>(data, "3");

                if (parsedPayload.action === "pick" && !parsedPayload.personKey) {
                    throw new Error("personKey is required for pick action");
                }

                // ── Snapshot which real customers own this product BEFORE any mutation ──
                // Needed for both: phantom picks stealing it, and releases returning it to shelf.
                const realCustomerIdsBefore = await CartItemService.getCustomersWithProduct(
                    parsedPayload.storeProductId,
                );

                const cartEventPayload =
                    parsedPayload.action === "pick"
                        ? {
                            personKey: parsedPayload.personKey as string,
                            storeProductId: parsedPayload.storeProductId,
                            action: parsedPayload.action,
                        }
                        : {
                            storeProductId: parsedPayload.storeProductId,
                            action: parsedPayload.action,
                        };

                const result = await CartItemService.handleAICartEvent(cartEventPayload);

                // result = null means:
                // - unknown person pick -> saved in phantom cart
                // - release -> product removed globally
                if (!result) {
                    const status =
                        parsedPayload.action === "release"
                            ? "product_released_globally"
                            : "phantom_cart_saved";

                    socket.emit("backend:cart_ack", {
                        status,
                        personKey: parsedPayload.personKey,
                        storeProductId: parsedPayload.storeProductId,
                    });

                    console.log("[AI] cart event handled without mobile update:", {
                        status,
                        personKey: parsedPayload.personKey,
                        storeProductId: parsedPayload.storeProductId,
                        action: parsedPayload.action,
                    });

                    // ── On release: notify every real customer whose item was returned to shelf ──
                    if (parsedPayload.action === "release" && realCustomerIdsBefore.length > 0) {
                        for (const customerId of realCustomerIdsBefore) {
                            try {
                                const updatedCart = await CartItemService.getCustomerCart(customerId);
                                const warnings = await CartItemService.getHealthWarnings(customerId, updatedCart);

                                io.of("/mobile")
                                    .to(`customer:${customerId}`)
                                    .emit("cart:updated", {
                                        customerId,
                                        action: "release",
                                        item: null,
                                        cart: updatedCart,
                                        warnings,
                                    });

                                console.log(
                                    `[AI] Notified customer ${customerId} — item returned to shelf`,
                                );
                            } catch (notifyErr: any) {
                                console.error(
                                    `[AI] Failed to notify customer ${customerId} on release:`,
                                    notifyErr.message,
                                );
                            }
                        }
                    }

                    // ── On phantom pick: notify real customers whose item was stolen ──
                    if (parsedPayload.action === "pick" && realCustomerIdsBefore.length > 0) {
                        for (const customerId of realCustomerIdsBefore) {
                            try {
                                const updatedCart = await CartItemService.getCustomerCart(customerId);
                                const warnings = await CartItemService.getHealthWarnings(customerId, updatedCart);

                                io.of("/mobile")
                                    .to(`customer:${customerId}`)
                                    .emit("cart:updated", {
                                        customerId,
                                        action: "release",
                                        item: null,
                                        cart: updatedCart,
                                        warnings,
                                    });

                                console.log(
                                    `[AI] Notified customer ${customerId} — item removed by phantom pick`,
                                );
                            } catch (notifyErr: any) {
                                console.error(
                                    `[AI] Failed to notify customer ${customerId}:`,
                                    notifyErr.message,
                                );
                            }
                        }
                    }

                    return;
                }

                // real customer cart updated -> notify mobile
                const warnings = await CartItemService.getHealthWarnings(
                    result.customerId,
                    result.update.cart,
                );

                io.of("/mobile")
                    .to(`customer:${result.customerId}`)
                    .emit("cart:updated", {
                        customerId: result.customerId,
                        ...result.update,
                        warnings,
                    });

                socket.emit("backend:cart_ack", {
                    status: "customer_cart_updated",
                    customerId: result.customerId,
                    storeProductId: parsedPayload.storeProductId,
                });

                console.log("[AI] cart event handled:", {
                    customerId: result.customerId,
                    storeProductId: parsedPayload.storeProductId,
                    action: parsedPayload.action,
                });

                // ── Notify any other real customers displaced by this pick ──
                const displacedCustomerIds = realCustomerIdsBefore.filter(
                    (id) => id !== result.customerId,
                );

                for (const customerId of displacedCustomerIds) {
                    try {
                        const updatedCart = await CartItemService.getCustomerCart(customerId);
                        const displacedWarnings = await CartItemService.getHealthWarnings(customerId, updatedCart);

                        io.of("/mobile")
                            .to(`customer:${customerId}`)
                            .emit("cart:updated", {
                                customerId,
                                action: "release",
                                item: null,
                                cart: updatedCart,
                                warnings: displacedWarnings,
                            });

                        console.log(
                            `[AI] Notified displaced customer ${customerId} — item taken by ${result.customerId}`,
                        );
                    } catch (notifyErr: any) {
                        console.error(
                            `[AI] Failed to notify displaced customer ${customerId}:`,
                            notifyErr.message,
                        );
                    }
                }

            } catch (error: any) {
                console.error("ai:cart_event error:", error.message);

                socket.emit("socket:error", {
                    message: "Failed to handle cart event",
                    error: error.message,
                });
            }
        });

        // ─────────────────────────────────────────
        // Event type 4: stock snapshot
        //
        // AI sends:
        // 4{"items":[{"storeProductId":"..."}]}
        //
        // Meaning:
        // AI sees these products on the shelf.
        //
        // Backend:
        // remove products from real carts and phantom carts
        // ─────────────────────────────────────────

        socket.on("ai:stock_snapshot", async (data) => {
            try {
                console.log("[AI] stock snapshot raw:", data);

                const parsedPayload = parseTypedMessage<StockSnapshotPayload>(
                    data,
                    "4",
                );

                const result = await CartItemService.handleAIStockSnapshot(
                    parsedPayload,
                );

                // Notify all affected customers' mobile apps
                if (result.affectedCustomers && result.affectedCustomers.length > 0) {
                    for (const customerId of result.affectedCustomers) {
                        try {
                            const updatedCart = await CartItemService.getCustomerCart(customerId);
                            const warnings = await CartItemService.getHealthWarnings(customerId, updatedCart);

                            io.of("/mobile")
                                .to(`customer:${customerId}`)
                                .emit("cart:updated", {
                                    customerId,
                                    action: "release",
                                    item: null,
                                    cart: updatedCart,
                                    warnings,
                                });

                            console.log(
                                `[AI] Stock Snapshot: Notified customer ${customerId} — items removed from shelf`,
                            );
                        } catch (notifyErr: any) {
                            console.error(
                                `[AI] Stock Snapshot: Failed to notify customer ${customerId}:`,
                                notifyErr.message,
                            );
                        }
                    }
                }

                socket.emit("backend:stock_ack", {
                    status: "stock_snapshot_handled",
                    handledItems: result.handledItems,
                    items: result.items,
                });

                console.log("[AI] stock snapshot handled:", result);
            } catch (error: any) {
                console.error("ai:stock_snapshot error:", error.message);

                socket.emit("socket:error", {
                    message: "Failed to handle stock snapshot",
                    error: error.message,
                });
            }
        });

        // ─────────────────────────────────────────
        // Event type 5: person left / checkout
        //
        // AI sends:
        // 5{"personKey":"uuid"}
        //
        // Backend:
        // - real customer -> notify mobile checkout
        // - phantom person -> remove phantom cart
        //
        // Important:
        // We do NOT send cart back to AI.
        // ─────────────────────────────────────────

        socket.on("ai:person_left", async (data) => {
            try {
                console.log("[AI] person left raw:", data);

                const parsedPayload = parseTypedMessage<PersonLeftPayload>(
                    data,
                    "5",
                );

                const result = await CartItemService.handleAIPersonLeft(
                    parsedPayload.personKey,
                );

                if (result.status === "customer_left" && result.customerId) {
                    io.of("/mobile")
                        .to(`customer:${result.customerId}`)
                        .emit("checkout:completed", {
                            customerId: result.customerId,
                        });
                }

                socket.emit("backend:person_left_ack", {
                    status: result.status,
                    personKey: parsedPayload.personKey,
                    customerId: result.customerId,
                });

                console.log("[AI] person left handled:", result);
            } catch (error: any) {
                console.error("ai:person_left error:", error.message);

                socket.emit("socket:error", {
                    message: "Failed to handle person left event",
                    error: error.message,
                });
            }
        });

        // ─────────────────────────────────────────
        // Event type 6: direct checkout (retrospective matching attribution)
        //
        // AI sends:
        // 6{"personKey":"uuid", "storeProductId":"uuid"}
        //
        // Backend:
        // - Directly creates an order for the customer with the product
        // - Emits checkout:completed to the customer's mobile app
        // ─────────────────────────────────────────

        socket.on("ai:direct_checkout", async (data) => {
            try {
                console.log("[AI] direct checkout raw:", data);

                const parsedPayload = parseTypedMessage<{
                    personKey: string;
                    storeProductId: string;
                }>(data, "6");

                const customerId = parsedPayload.personKey;
                const storeProductId = parsedPayload.storeProductId;

                if (!Types.ObjectId.isValid(customerId) || !Types.ObjectId.isValid(storeProductId)) {
                    throw new Error("Invalid customerId or storeProductId format");
                }

                // Verify customer exists
                const customerExists = await CustomerModel.findById(customerId);
                if (!customerExists) {
                    throw new Error("Customer not found");
                }

                // Directly create order from this item
                const order = await CartItemService.createOrderFromCartPublic(
                    customerId,
                    [{ storeProductId, quantity: 1 }]
                );

                if (order) {
                    console.log(`[AI] Direct Checkout: Created order ${order._id} for customer ${customerId} with product ${storeProductId}`);
                    // Notify mobile app of successful checkout
                    io.of("/mobile")
                        .to(`customer:${customerId}`)
                        .emit("checkout:completed", {
                            customerId: customerId,
                            orderId: order._id.toString(),
                        });
                }

                socket.emit("backend:direct_checkout_ack", {
                    status: "direct_checkout_handled",
                    customerId,
                    storeProductId,
                    orderId: order ? order._id.toString() : null,
                });
            } catch (error: any) {
                console.error("ai:direct_checkout error:", error.message);
                socket.emit("socket:error", {
                    message: "Failed to handle direct checkout",
                    error: error.message,
                });
            }
        });

        socket.on("ai:get_debug_data", async (ack) => {
            try {
                const customers = await CustomerModel.find({}, "firstName lastName email").lean();
                const storeProductsRaw = await StoreProductModel.find().lean();
                const storeProducts = [];
                for (const sp of storeProductsRaw) {
                    const product = await ProductModel.findById(sp.productId).lean();
                    storeProducts.push({
                        _id: sp._id.toString(),
                        name: product ? product.name : "Unknown Product",
                        price: sp.price,
                    });
                }
                if (typeof ack === "function") {
                    ack({ customers, storeProducts });
                }
            } catch (err: any) {
                console.error("ai:get_debug_data error:", err.message);
            }
        });

        socket.on("disconnect", (reason) => {
            aiConnectedCount = Math.max(0, aiConnectedCount - 1);
            console.log(`[AI] Disconnected: ${socket.id} (${reason}) (active clients: ${aiConnectedCount})`);
        });
    });

    // ─────────────────────────────────────────────
    // Mobile namespace
    // ─────────────────────────────────────────────

    const mobileNamespace = io.of("/mobile");
    mobileNamespace.use(authenticateMobileSocket);

    mobileNamespace.on("connection", async (socket: Socket) => {
        const customerId = socket.data.customerId as string;
        const room = `customer:${customerId}`;

        const existingSockets = await mobileNamespace.in(room).fetchSockets();

        for (const existing of existingSockets) {
            if (existing.id !== socket.id) {
                existing.emit("session:replaced", {
                    message: "Another device connected to your account",
                });

                existing.disconnect(true);

                console.log(
                    `[Mobile] Kicked previous session: ${existing.id} customer:${customerId}`,
                );
            }
        }

        await socket.join(room);

        console.log(`[Mobile] Connected: ${socket.id} customer:${customerId}`);

        try {
            const cart = await CartItemService.getCustomerCart(customerId);
            const warnings = await CartItemService.getHealthWarnings(customerId, cart);

            socket.emit("cart:current", {
                customerId,
                cart,
                warnings,
            });
        } catch (error: any) {
            socket.emit("socket:error", {
                message: error.message,
            });
        }

        socket.on("disconnect", (reason) => {
            console.log(`[Mobile] Disconnected: ${socket.id} (${reason})`);
        });
    });

    console.log("[Socket.IO] Server initialised with /ai and /mobile namespaces");

    return io;
}