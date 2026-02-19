import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "dirmaster-directory",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
