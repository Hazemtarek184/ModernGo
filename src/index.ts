import { createServer } from "http";
import app from "./app";
import connectDB from "./DB/Connection";
import { initSocketServer } from "./socket/Socket-Server";

// Connect to Database once globally
connectDB();

// Start servers for local development
if (process.env.VERCEL !== '1') {
    // Start REST API server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} 🚀`);
    });

    // Start Socket.IO server on separate port (waits for DB)
    const SOCKET_PORT = process.env.SOCKET_PORT || 3001;
    const httpServer = createServer(app);
    initSocketServer(httpServer);
    connectDB().then(() => {
        httpServer.listen(SOCKET_PORT, () => {
            console.log(`🚀 Socket server is running on port ${SOCKET_PORT}`);
            console.log(`   REST API:    http://localhost:${SOCKET_PORT}`);
            console.log(`   Socket /ai:  ws://localhost:${SOCKET_PORT}/ai`);
            console.log(`   Socket /mob: ws://localhost:${SOCKET_PORT}/mobile`);
        });
    });
}

// Export for Vercel serverless
export default app;