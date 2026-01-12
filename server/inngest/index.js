import { Inngest } from "inngest";
import UserModel from "../models/User.js";
import Connection from "../models/Connections.js";
import sendEmail from "../configs/nodeMailer.js";

// create client
export const inngest = new Inngest({ id: "pingup-app" });

// define functions here or import from clerk file
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
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    await UserModel.findByIdAndUpdate(id, {
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
    });
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await UserModel.findByIdAndDelete(id);
  }
);


  const  sendNewConnectionRequestReminder = inngest.createFunction(
    {id:"send-new-connections-request-reminder"},
    {event:"app/connections-request"},
    async({event,step})=>{
      const {connectionId} = event.data;
      await step.run('send-connections-request-mail',async()=>{
        const  connection  = await Connection.findById(connectionId).populate('from_user_id to_user_id');
        const  subject = `New Connect Request`;
        const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Hi ${connection.to_user_id.full_name},</h2>
  <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
  <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #1b98c8;">here</a> to accept or reject the request</p>
  <br/>
  <p>Thanks,<br/>PingUp - Stay Connected</p>
</div>`;


await sendEmail({
  to:connection.to_user_id.email,
  subject,
  body
})
      })

       const in24Hours = new Date(Date.now()+ 24*60*60*1000);
       await step.sleepUntil("wait-for-24-hours",in24Hours);
       await step.run('send-connection-request-reminder',async()=>{
        const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id')
        if(connection.status === "accepted"){
          return {message:"Allready accepted"}
        }
         const  subject = `New Connect Request`;
        const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Hi ${connection.to_user_id.full_name},</h2>
  <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
  <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #1b98c8;">here</a> to accept or reject the request</p>
  <br/>
  <p>Thanks,<br/>PingUp - Stay Connected</p>
</div>`;


await sendEmail({
  to:connection.to_user_id.email,
  subject,
  body
})
return {message:"Reminder sent."}
      })
    }
  )
// export functions array
export const functions = [
  syncUserCreation,      
  syncUserUpdation,
  syncUserDeletion,
  sendNewConnectionRequestReminder
];
