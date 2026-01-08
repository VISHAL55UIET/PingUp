import { Inngest } from "inngest";
import User from "../models/user.js";  // add extension

export const inngest = new Inngest({ id: "pingup-app" });

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_address, image_url } = event.data;
    let username = email_address[0].email_address.split("@")[0];

    const existing = await User.findOne({ username });
    if (existing) {
      username = username + Math.floor(Math.random() * 10000);
    }

    await User.create({
      _id: id,
      email: email_address[0].email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
      username,
    });
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_address, image_url } = event.data;
    await User.findByIdAndUpdate(id, {
      email: email_address[0].email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
    });
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  }
);

// ❗ Array export FIX (you wrote wrong variable names)
export const functions = [
  syncUserCreation,
  syncUserUpdation,  // was wrong in your file
  syncUserDeletion,  // was wrong in your file
];
    