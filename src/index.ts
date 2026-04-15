import app from "./app";
import connectDB from "./DB/Connection";

// Connect to Database once globally
connectDB();

// Start server for local development
if (process.env.VERCEL !== '1') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} 🚀`);
    });
}

// Export for Vercel serverless
export default app;