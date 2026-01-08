import { serve } from "inngest/next";
import { inngest, functions } from "../inngest/index.js";

export default serve({
  client: inngest,
  functions,
});
