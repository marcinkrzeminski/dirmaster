import { NextRequest, NextResponse } from "next/server";
import { init as initAdmin } from "@instantdb/admin";
import { id as generateId } from "@instantdb/admin";
import { submissionSchema } from "shared";
import { schema } from "db";
import { inngest } from "@/inngest/client";

function getAdminDb() {
  return initAdmin({
    appId: process.env.INSTANTDB_APP_ID!,
    adminToken: process.env.INSTANTDB_ADMIN_TOKEN!,
    schema,
  });
}

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
    const submissionId = generateId();

    await db.transact([
      db.tx.submissions[submissionId].update({
        projectId,
        data,
        status: "pending",
        createdAt: Date.now(),
      }),
    ]);

    // Fire Inngest event for notification
    await inngest.send({
      name: "submission/received",
      data: { projectId, submissionId, data },
    });

    return NextResponse.json({ ok: true, id: submissionId });
  } catch (err) {
    console.error("[submissions] POST error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
