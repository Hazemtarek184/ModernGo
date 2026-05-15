/**
 * Separate entry point for the Socket.IO server.
 *
 * Usage:
 *   npm run dev:socket     (development with hot-reload)
 *   npm run start:socket   (production)
 *
 * This wraps the Express app in an HTTP server so Socket.IO can
 * attach to it. The REST API remains fully functional on the same port.
 */
import connectionDB from "./DB/Connection";
import "dotenv/config.js";
import { createServer } from "http";
import app from "./app";
import { initSocketServer } from "./socket/Socket-Server";

const SOCKET_PORT = process.env.SOCKET_PORT || 3001;

// Create a raw HTTP server from the Express app
const httpServer = createServer(app);

// Attach Socket.IO
initSocketServer(httpServer);
connectionDB().then(() => {
    httpServer.listen(SOCKET_PORT, () => {
        console.log(`🚀 Socket server is running on port ${SOCKET_PORT}`);
        console.log(`   REST API:    http://localhost:${SOCKET_PORT}`);
        console.log(`   Socket /ai:  ws://localhost:${SOCKET_PORT}/ai`);
        console.log(`   Socket /mob: ws://localhost:${SOCKET_PORT}/mobile`);
    });
});