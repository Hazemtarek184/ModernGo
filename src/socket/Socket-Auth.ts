import type { Socket } from "socket.io";
import { verifyToken } from "../utils/jwt.utils";

type NextFn = (err?: Error) => void;

// ─── AI Namespace Auth ───────────────────────────────────────────────

/**
 * Socket.IO middleware for the `/ai` namespace.
 * The AI vision system authenticates with a shared API key.
 *
 * Expected handshake:
 *   io("/ai", { auth: { apiKey: "..." } })
 */
export const authenticateAiSocket = (socket: Socket, next: NextFn): void => {
    const apiKey = socket.handshake.auth?.apiKey as string | undefined;

    if (!apiKey) {
        return next(new Error("Authentication error: API key is required"));
    }

    const secret = process.env.AI_SOCKET_SECRET;

    if (!secret) {
        console.error("[Socket-Auth] AI_SOCKET_SECRET env var is not set");
        return next(new Error("Authentication error: server misconfiguration"));
    }

    if (apiKey !== secret) {
        return next(new Error("Authentication error: invalid API key"));
    }

    // Tag the socket for logging / debugging
    socket.data.role = "ai";
    next();
};

// ─── Mobile Namespace Auth ───────────────────────────────────────────

/**
 * Socket.IO middleware for the `/mobile` namespace.
 * The Flutter app authenticates with the same JWT used for REST APIs.
 *
 * Expected handshake:
 *   io("/mobile", { auth: { token: "eyJ..." } })
 */
export const authenticateMobileSocket = (socket: Socket, next: NextFn): void => {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
        return next(new Error("Authentication error: JWT token is required"));
    }

    try {
        const payload = verifyToken(token);

        if (payload.role !== "customer") {
            return next(new Error("Authentication error: only customers can connect"));
        }

        // Attach customer data so event handlers can use it
        socket.data.customerId = payload.entityId;
        socket.data.email = payload.email;
        socket.data.role = "customer";

        next();
    } catch {
        return next(new Error("Authentication error: invalid or expired token"));
    }
};
