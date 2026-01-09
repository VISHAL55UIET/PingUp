import { Inngest } from "inngest";
import { serve } from "inngest/express";
import { functions } from "../inngest/index.js";

const inngestClient = new Inngest({ id: "pingup-app" });

export default serve({
  client: inngestClient,
  functions,
});
