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
 * Notification: triggered when a new submission is received.
 */
export const onSubmissionReceived = inngest.createFunction(
  { id: "on-submission-received", name: "On Submission Received" },
  { event: "submission/received" },
  async ({ event }) => {
    const { projectId, submissionId, data } = event.data as {
      projectId: string;
      submissionId: string;
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
        subject: `New submission for project ${projectId}`,
        body: `
          <h2>New submission received</h2>
          <p>Submission ID: ${submissionId}</p>
          <pre>${JSON.stringify(data, null, 2)}</pre>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Review in HQ</a></p>
        `,
      }),
    });

    return { notified: true };
  }
);
