import { Inngest } from "inngest";
import User from "../models/User.js";   // correct model import
import mongoose from "mongoose";
import "dotenv/config";

await mongoose.connect(process.env.MONGO_URI);
console.log("Mongo connected for Inngest");

export const inngest = new Inngest({ id: "pingup-app" });

export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const emailList = event.data.email_addresses || [];
    const primaryEmail = emailList.length > 0 ? emailList[0].email_address : null;

    if (!primaryEmail) return;

    let username = primaryEmail.split("@")[0];
    const existing = await User.findOne({ username });

    if (existing) {
      username += Math.floor(Math.random() * 10000);
    }

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

export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion   // include deletion also
];

// ❗MANDATORY EXPORT FOR VERCEL HANDLER
export default functions;
