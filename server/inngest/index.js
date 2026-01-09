import { Inngest } from "inngest";
import User from "../models/User.js";
import mongoose from "mongoose";
import "dotenv/config";
import express from "express";

const app = express();

// ❗ Remove app.listen() if exists (Vercel me nahi chahiye)

// Basic test route so browser doesn't show 404
app.get("/", (req, res) => {
  res.status(200).send("PingUp API is live");
});

// Connect DB for Inngest functions
await mongoose.connect(process.env.MONGO_URI);
console.log("Mongo connected for Inngest");

// Initialize Inngest
export const inngest = new Inngest({ id: "pingup-app" });

// Inngest functions
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const emailList = event.data.email_addresses || [];
    const primaryEmail = emailList.length > 0 ? emailList[0].email_address : null;
    if (!primaryEmail) return;

    let username = primaryEmail.split("@")[0];
    const existing = await User.findOne({ username });
    if (existing) username += Math.floor(Math.random() * 10000);

    await User.create({
      _id: event.data.id,
      email: primaryEmail,
      full_name: `${event.data.first_name} ${event.data.last_name}`,
      profile_picture: event.data.image_url,
      username
    });
  }
);

export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const emailList = event.data.email_addresses || [];
    const primaryEmail = emailList.length > 0 ? emailList[0].email_address : null;
    if (!primaryEmail) return;

    await User.findByIdAndUpdate(event.data.id, {
      email: primaryEmail,
      full_name: `${event.data.first_name} ${event.data.last_name}`,
      profile_picture: event.data.image_url
    });
  }
);

export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await User.findByIdAndDelete(event.data.id);
  }
);

// Inngest export (Vercel background workers ke liye)
export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion
];

// ❗ HTTP handler export for Vercel (404 fix)
export default (req, res) => {
  app(req, res);
};
