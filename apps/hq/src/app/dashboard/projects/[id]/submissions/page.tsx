"use client";

import { use, useState } from "react";
import { db } from "@/lib/db";
import { Button, Badge, Card, CardContent } from "ui";
import type { EntryStatus } from "shared";

type ReviewStatus = "pending" | "published" | "rejected";

const STATUS_VARIANTS: Record<ReviewStatus, "warning" | "success" | "destructive"> = {
  pending: "warning",
  published: "success",
  rejected: "destructive",
};

export default function SubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const [filter, setFilter] = useState<ReviewStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = db.useQuery({
    projects: { $: { where: { id: projectId } } },
    entries: {
      $: {
        where: {
          projectId,
          status: filter === "all" ? { in: ["pending", "published", "rejected"] } : filter,
        },
      },
    },
  });

  const project = data?.projects?.[0];
  const entries = data?.entries ?? [];
  const pendingCount = entries.filter((e) => e.status === "pending").length;

  async function handleApprove(entryId: string) {
    await db.transact([
      db.tx.entries[entryId].update({ status: "published", publishedAt: Date.now() }),
    ]);
  }

  async function handleReject(entryId: string) {
    await db.transact([
      db.tx.entries[entryId].update({
        status: "rejected",
        rejectionReason: rejectReason || "Not approved",
      }),
    ]);
    setExpandedId(null);
    setRejectReason("");
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {project?.name ?? "Project"} — Pending Entries
        </h1>
        <p className="text-muted-foreground">{pendingCount} awaiting review</p>
      </div>

      <div className="flex gap-2">
        {(["all", "pending", "published", "rejected"] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
          >
            {s}
            {s === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-yellow-200 px-1.5 py-0.5 text-xs text-yellow-800">
                {pendingCount}
              </span>
            )}
          </Button>
        ))}
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No entries{filter !== "all" ? ` with status "${filter}"` : ""}.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const metadata = entry.metadata as Record<string, unknown> | null;
            const isExpanded = expandedId === entry.id;
            const status = entry.status as EntryStatus;

            return (
              <Card key={entry.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={STATUS_VARIANTS[status as ReviewStatus] ?? "secondary"}>
                          {status}
                        </Badge>
                        <span className="font-medium">{entry.title as string}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.createdAt as number).toLocaleDateString()}
                        </span>
                      </div>
                      {metadata && (
                        <div className="mt-2 text-sm">
                          {Object.entries(metadata)
                            .slice(0, 3)
                            .map(([k, v]) => (
                              <span key={k} className="mr-4 text-muted-foreground">
                                <span className="font-medium text-foreground">{k}:</span>{" "}
                                {String(v).slice(0, 60)}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      >
                        {isExpanded ? "Collapse" : "View"}
                      </Button>
                      {status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(entry.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-red-50"
                            onClick={() => setExpandedId(entry.id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 rounded-md border bg-muted/50 p-4">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(metadata ?? entry.content, null, 2)}
                      </pre>
                      {status === "pending" && (
                        <div className="mt-4 space-y-2">
                          <textarea
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            placeholder="Rejection reason (optional)"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={2}
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(entry.id)}
                          >
                            Confirm Reject
                          </Button>
                        </div>
                      )}
                      {(entry.rejectionReason as string | undefined) && (
                        <p className="mt-2 text-sm text-destructive">
                          Reason: {entry.rejectionReason as string}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
