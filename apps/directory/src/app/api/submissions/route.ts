import { NextRequest, NextResponse } from "next/server";
import { init as initAdmin, id as generateId } from "@instantdb/admin";
import { z } from "zod";
import { schema } from "db";
import { inngest } from "@/inngest/client";

function getAdminDb() {
  return initAdmin({
    appId: process.env.INSTANTDB_APP_ID!,
    adminToken: process.env.INSTANTDB_ADMIN_TOKEN!,
    schema,
  });
}

const submissionSchema = z.object({
  projectId: z.string().min(1),
  data: z.record(z.unknown()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Honeypot check
    if (body._hp) {
      return NextResponse.json({ ok: true });
    }

    const parsed = submissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const { projectId, data } = parsed.data;
    const db = getAdminDb();
    const entryId = generateId();

    const title =
      (data.name as string) ||
      (data.title as string) ||
      `Submission ${entryId.slice(0, 6)}`;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    await db.transact([
      db.tx.entries[entryId].update({
        projectId,
        title,
        slug,
        content: JSON.stringify(data, null, 2),
        status: "pending",
        metadata: data,
        createdAt: Date.now(),
      }),
    ]);

    try {
      await inngest.send({
        name: "entry/received",
        data: { projectId, entryId, data },
      });
    } catch (inngestErr) {
      console.warn("[submissions] inngest.send failed (non-fatal):", inngestErr);
    }

    return NextResponse.json({ ok: true, id: entryId });
  } catch (err) {
    console.error("[submissions] POST error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
