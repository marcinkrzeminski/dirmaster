import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "dirmaster-hq",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
