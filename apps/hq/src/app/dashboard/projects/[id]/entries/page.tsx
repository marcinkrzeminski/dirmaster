"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/db";
import { Button, Badge, Card, CardContent } from "ui";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { EntryStatus } from "shared";
import { invalidateEntryCache } from "cache";

const STATUS_VARIANTS: Record<EntryStatus, "secondary" | "success" | "outline" | "warning" | "destructive"> = {
  draft: "secondary",
  published: "success",
  archived: "outline",
  pending: "warning",
  rejected: "destructive",
};

export default function EntriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const searchParams = useSearchParams();
  const initialFilter = (searchParams.get("status") as EntryStatus | "all") ?? "all";
  const [filter, setFilter] = useState<EntryStatus | "all">(initialFilter);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = db.useQuery({
    projects: {
      $: { where: { id: projectId } },
    },
    entries: {
      $: { where: { projectId } },
    },
  });

  const project = data?.projects?.[0];
  const allEntries = data?.entries ?? [];
  const entries =
    filter === "all" ? allEntries : allEntries.filter((e) => e.status === filter);

  const pendingCount = allEntries.filter((e) => e.status === "pending").length;

  async function handleDelete(entryId: string, slug: string) {
    if (!confirm("Delete this entry?")) return;
    await db.transact([db.tx.entries[entryId].delete()]);
    await invalidateEntryCache(projectId, slug);
  }

  async function handleTogglePublish(entry: (typeof allEntries)[0]) {
    const newStatus = entry.status === "published" ? "draft" : "published";
    await db.transact([
      db.tx.entries[entry.id].update({
        status: newStatus,
        publishedAt: newStatus === "published" ? Date.now() : undefined,
      }),
    ]);
    await invalidateEntryCache(projectId, entry.slug as string);
  }

  async function handleApprove(entryId: string, slug: string) {
    await db.transact([
      db.tx.entries[entryId].update({ status: "published", publishedAt: Date.now() }),
    ]);
    await invalidateEntryCache(projectId, slug);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {project?.name ?? "Project"} — Entries
          </h1>
          <p className="text-muted-foreground">{allEntries.length} total entries</p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/projects/${projectId}/entries/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Link>
        </Button>
      </div>

      <div className="flex gap-2">
        {(["all", "draft", "published", "archived", "pending", "rejected"] as const).map((s) => (
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
        <div className="space-y-2">
          {entries.map((entry) => {
            const status = entry.status as EntryStatus;
            const isPending = status === "pending";
            const isExpanded = expandedId === entry.id;
            const metadata = entry.metadata as Record<string, unknown> | null;

            return (
              <Card key={entry.id}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.title as string}</span>
                        <Badge variant={STATUS_VARIANTS[status]}>
                          {status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">/{entry.slug as string}</p>
                    </div>
                    <div className="flex gap-2">
                      {isPending ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                          >
                            {isExpanded ? "Collapse" : "View"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(entry.id, entry.slug as string)}
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
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTogglePublish(entry)}
                          >
                            {status === "published" ? "Unpublish" : "Publish"}
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/projects/${projectId}/entries/${entry.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(entry.id, entry.slug as string)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {isPending && isExpanded && (
                    <div className="mt-4 rounded-md border bg-muted/50 p-4">
                      {metadata && (
                        <pre className="text-xs overflow-auto">
                          {JSON.stringify(metadata, null, 2)}
                        </pre>
                      )}
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
