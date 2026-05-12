import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { authenticateAiSocket, authenticateMobileSocket } from "./Socket-Auth";
import CartItemService from "../cart/CartItem-Service";
import type { ICartActionPayload } from "../types/CartItem-Interface";

// ─── Zod-style runtime validation (light, no extra dep) ─────────────

function isValidCartAction(data: unknown): data is ICartActionPayload {
    if (typeof data !== "object" || data === null) return false;
    const obj = data as Record<string, unknown>;
    return (
        typeof obj.customerId === "string" &&
        typeof obj.storeProductId === "string" &&
        (obj.action === "pick" || obj.action === "release")
    );
}

// ─── Initialiser ─────────────────────────────────────────────────────

/**
 * Create and attach a Socket.IO server to the given HTTP server.
 * Returns the io instance for external use if needed.
 */
export function initSocketServer(httpServer: HttpServer): Server {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.NODE_ENV === "production"
                ? [process.env.FRONTEND_URL || "https://your-app.com"]
                : "*",
            methods: ["GET", "POST"],
            credentials: true,
        },
        // Ping every 25 s, timeout after 20 s — tuned for mobile networks
        pingInterval: 25_000,
        pingTimeout: 20_000,
    });

    // ── /ai namespace ────────────────────────────────────────────────

    const aiNamespace = io.of("/ai");
    aiNamespace.use(authenticateAiSocket);

    aiNamespace.on("connection", (socket: Socket) => {
        console.log(`[AI] Connected: ${socket.id}`);

        socket.on("cart:action", async (data: unknown, ack?: (res: unknown) => void) => {
            try {
                // 1. Validate payload
                if (!isValidCartAction(data)) {
                    const err = { success: false, error: "Invalid payload: requires customerId, storeProductId, action (pick|release)" };
                    if (typeof ack === "function") ack(err);
                    return;
                }

                // 2. Process the action (DB write)
                const result = await CartItemService.handleCartAction(data);

                // 3. Broadcast to the customer's mobile room
                const room = `customer:${data.customerId}`;
                io.of("/mobile").to(room).emit("cart:updated", result);

                // 4. Acknowledge back to AI
                if (typeof ack === "function") {
                    ack({ success: true, item: result.item });
                }

                console.log(`[AI] cart:action ${data.action} → customer:${data.customerId} / product:${data.storeProductId}`);
            } catch (error: any) {
                console.error("[AI] cart:action error:", error.message);
                if (typeof ack === "function") {
                    ack({ success: false, error: error.message });
                }
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(`[AI] Disconnected: ${socket.id} (${reason})`);
        });
    });

    // ── /mobile namespace ────────────────────────────────────────────

    const mobileNamespace = io.of("/mobile");
    mobileNamespace.use(authenticateMobileSocket);

    mobileNamespace.on("connection", async (socket: Socket) => {
        const customerId = socket.data.customerId as string;
        const room = `customer:${customerId}`;

        // ── Enforce single device per customer ───────────────────────
        // Disconnect any existing socket for this customer
        const existingSockets = await mobileNamespace.in(room).fetchSockets();
        for (const existing of existingSockets) {
            if (existing.id !== socket.id) {
                existing.emit("session:replaced", {
                    message: "Another device connected to your account",
                });
                existing.disconnect(true);
                console.log(`[Mobile] Kicked previous session: ${existing.id} (customer: ${customerId})`);
            }
        }

        // Join the customer's room
        void socket.join(room);
        console.log(`[Mobile] Connected: ${socket.id} (customer: ${customerId})`);

        // Send current cart state immediately on connect
        try {
            const cart = await CartItemService.getCustomerCart(customerId);
            socket.emit("cart:current", { cart });
        } catch (error: any) {
            socket.emit("error", { message: error.message });
        }

        socket.on("disconnect", (reason) => {
            console.log(`[Mobile] Disconnected: ${socket.id} (${reason})`);
        });
    });

    console.log("[Socket.IO] Server initialised with /ai and /mobile namespaces");
    return io;
}