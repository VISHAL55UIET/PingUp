import { Inngest } from "inngest";
import UserModel from "../models/User.js";

export const inngest = new Inngest({ id: "pingup-app" });
 
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_address, image_url } = event.data;
    let username = email_address[0].email_address.split("@")[0];

    const existing = await UserModel.findOne({ username });
    if (existing) {
      username = username + Math.floor(Math.random() * 10000);
    }

    await UserModel.create({
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
    const { id, email_address, image_url, first_name, last_name } = event.data;
    await UserModel.findByIdAndUpdate(id, {
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
    await UserModel.findByIdAndDelete(id);
  }
);
export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion
];
