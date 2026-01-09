import { Inngest } from "inngest";
import UserModel from "../models/User.js";
import mongoose from "mongoose";
import "dotenv/config";

await mongoose.connect(process.env.MONGO_URI);
console.log("Mongo connected for Inngest");

export const inngest = new Inngest({ id: "pingup-app" });

export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    console.log("User.create event:", event.data);

    const emailList = event.data.email_addresses || [];
    const primaryEmail = emailList.length > 0 ? emailList[0].email_address : null;

    if (!primaryEmail) {
      console.log("No email found, skipping insert");
      return;
    }

    let username = primaryEmail.split("@")[0];

    const existing = await UserModel.findOne({ username });
    if (existing) {
      username = username + Math.floor(Math.random() * 10000);
    }

    try {
      await UserModel.create({
        _id: event.data.id,
        email: primaryEmail,
        full_name: event.data.first_name + " " + event.data.last_name,
        profile_picture: event.data.image_url,
        username
      });
      console.log("User inserted in Mongo");
    } catch (err) {
      console.log("Insert failed:", err);
    }
  }
);

export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    console.log("User.update event:", event.data);

    const emailList = event.data.email_addresses || [];
    const primaryEmail = emailList.length > 0 ? emailList[0].email_address : null;

    if (!primaryEmail) {
      console.log("No email found, skipping update");
      return;
    }

    await UserModel.findByIdAndUpdate(event.data.id, {
      email: primaryEmail,
      full_name: event.data.first_name + " " + event.data.last_name,
      profile_picture: event.data.image_url
    });

    console.log("User updated in Mongo");
  }
);

export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    console.log("User.delete event:", event.data);
    await UserModel.findByIdAndDelete(event.data.id);
    console.log("User deleted from Mongo");
  }
);

export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion
];

