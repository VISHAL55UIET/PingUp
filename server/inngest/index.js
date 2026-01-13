import { Inngest } from "inngest";
import UserModel from "../models/User.js";
import Connection from "../models/Connections.js";
import sendEmail from "../configs/nodeMailer.js";
import Story from "../models/Story.js";
import Message from "../models/Message.js";
// import connectDB from "../configs/db.js"; // uncomment if not globally connected

// create client
export const inngest = new Inngest({ id: "pingup-app" });

// sync user creation
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    let username = email_addresses[0].email_address.split("@")[0];
    const user = await UserModel.findOne({ username });

    if (user) {
      username = username + Math.floor(Math.random() * 10000);
    }

    await UserModel.create({
      _id: id,
      email: email_addresses[0].email_address,
      full_name: `${first_name} ${last_name}`,
      profile_picture: image_url,
      username,
    });
  }
);

// sync user update
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    await UserModel.findByIdAndUpdate(id, {
      email: email_addresses[0].email_address,
      full_name: `${first_name} ${last_name}`,
      profile_picture: image_url,
    });
  }
);

// sync user deletion
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await UserModel.findByIdAndDelete(id);
  }
);

// send connection request + reminder
const sendNewConnectionRequestReminder = inngest.createFunction(
  { id: "send-new-connection-request-reminder" },
  { event: "app/connections-request" },
  async ({ event, step }) => {
    const { connectionId } = event.data;

    // FIRST MAIL
    await step.run("send-connection-request-mail", async () => {
      // await connectDB(); // enable if needed

      const connection = await Connection.findById(connectionId)
        .populate("from_user_id to_user_id");

      if (!connection) {
        throw new Error("Connection not found");
      }

      if (!connection.to_user_id || !connection.from_user_id) {
        throw new Error("User references missing");
      }

      const subject = "New Connect Request";
      const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${connection.to_user_id.full_name},</h2>
        <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
        <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #1b98c8;">here</a> to accept or reject the request</p>
        <br/>
        <p>Thanks,<br/>PingUp - Stay Connected</p>
      </div>`;

      await sendEmail({     
        to: connection.to_user_id.email,
        subject,
        body,
      });
    });

    // WAIT 24 HOURS
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24Hours);

    // REMINDER MAIL
    await step.run("send-connection-request-reminder", async () => {
      // await connectDB(); // enable if needed

      const connection = await Connection.findById(connectionId)
        .populate("from_user_id to_user_id");

      if (!connection) {
        throw new Error("Connection not found");
      }

      if (connection.status === "accepted") {
        return { message: "Already accepted" };
      }

      if (!connection.to_user_id || !connection.from_user_id) {
        throw new Error("User references missing");
      }

      const subject = "New Connect Request";
      const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${connection.to_user_id.full_name},</h2>
        <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
        <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #1b98c8;">here</a> to accept or reject the request</p>
        <br/>
        <p>Thanks,<br/>PingUp - Stay Connected</p>
      </div>`;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body,
      });

      return { message: "Reminder sent." };
    });
  }
);

const deleteStory =  inngest.createFunction(
  {id:'story-delete'},
  {event:'app/story.delete'},
  async({event,step})=>{
    const {storyId} = event.data;
    const in24Hours =  new Date(Date.now()+24*60*60*1000);
    await step.sleepUntil("wait-for-34-hours",in24Hours);
    await step.run("delete-story",async()=>{
      await Story.findByIdAndDelete(storyId);
      return {message:'Story Deleted'}
    })
  }
)

const sendNotificationMessageOfUnseenMessage = inngest.createFunction(
  { id: "send-unseen-message-notification" },
  {
    cron: "0 9 * * *",
    timezone: "America/New_York",
  },
  async ({ step }) => {
    const messages = await Message.find({ seen: false }).populate("to_user_id");

    const unseenCount = {};
    messages.forEach((message) => {
      unseenCount[message.to_user_id._id] =
        (unseenCount[message.to_user_id._id] || 0) + 1;
    });

    for (const userId in unseenCount) {
      const user = await UserModel.findById(userId);

      const subject = `You have ${unseenCount[userId]} unseen messages`;

      const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${user.full_name},</h2>
        <p>You have ${unseenCount[userId]} unseen messages</p>
        <p>
          Click <a href="${process.env.FRONTEND_URL}/messages" style="color: #10b981;">
            here
          </a> to view them
        </p>
        <br/>
        <p>Thanks,<br/>PingUp - Stay Connected</p>
      </div>
      `;

      await sendEmail({
        to: user.email,
        subject,
        body,
      });
    }

    return { message: "Notification sent." };
  }
);


// export functions
export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  sendNewConnectionRequestReminder,
  deleteStory,
  sendNotificationMessageOfUnseenMessage
]; 