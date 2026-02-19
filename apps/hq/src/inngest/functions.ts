import { inngest } from "./client";
import { invalidateProjectCache, invalidateEntryCache } from "cache";

/**
 * Cache warming: triggered after entry published/updated.
 */
export const onEntryPublished = inngest.createFunction(
  { id: "on-entry-published", name: "On Entry Published" },
  { event: "entry/published" },
  async ({ event }) => {
    const { projectId, entrySlug } = event.data as {
      projectId: string;
      entrySlug: string;
    };
    await invalidateEntryCache(projectId, entrySlug);
    return { invalidated: true };
  }
);

/**
 * Notification: triggered when a new entry is submitted via public form.
 */
export const onEntryReceived = inngest.createFunction(
  { id: "on-entry-received", name: "On Entry Received" },
  { event: "entry/received" },
  async ({ event }) => {
    const { projectId, entryId, data } = event.data as {
      projectId: string;
      entryId: string;
      data: Record<string, unknown>;
    };

    const plunkApiKey = process.env.PLUNK_API_KEY;
    if (!plunkApiKey) return { skipped: "no PLUNK_API_KEY" };

    // Send notification email via Plunk
    await fetch("https://api.useplunk.com/v1/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${plunkApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: process.env.NOTIFICATION_EMAIL,
        subject: `New pending entry for project ${projectId}`,
        body: `
          <h2>New entry pending review</h2>
          <p>Entry ID: ${entryId}</p>
          <pre>${JSON.stringify(data, null, 2)}</pre>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Review in HQ</a></p>
        `,
      }),
    });

    return { notified: true };
  }
);
