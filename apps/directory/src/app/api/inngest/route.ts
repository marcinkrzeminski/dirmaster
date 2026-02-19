import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";

// Directory app has no server-side Inngest functions for now.
// It sends events; HQ listens.
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [],
});
