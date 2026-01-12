import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";
import userRouter from "./routes/userRoutes.js";
import postRouter from "./routes/postRoutes.js";

const app = express();

// ✅ CONNECT DB ON SERVER START
await connectDB();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// Test route
app.get("/", (req, res) => res.send("Server is running..."));

// Inngest webhook
app.use("/api/inngest", serve({ client: inngest, functions }));

// Routes
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);

// ✅ START SERVER (OLD WAY)
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
