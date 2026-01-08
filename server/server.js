import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { inngest, functions } from "./inngest/index.js";

const app = express();

// Connect DB
await connectDB();

// Middlewares
app.use(express.json());
app.use(cors());

// Test route
app.get("/", (req, res) => res.send("server is running....."));
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`server is running onn port ${PORT}`));
