"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { Button, Badge, Card, CardContent } from "ui";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { EntryStatus } from "shared";
import { invalidateEntryCache } from "cache";

const STATUS_VARIANTS = {
  draft: "secondary",
  published: "success",
  archived: "outline",
} as const;

export default function EntriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const [filter, setFilter] = useState<EntryStatus | "all">("all");

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
        {(["all", "draft", "published", "archived"] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
          >
            {s}
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
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.title as string}</span>
                    <Badge variant={STATUS_VARIANTS[entry.status as EntryStatus]}>
                      {entry.status as string}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">/{entry.slug as string}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePublish(entry)}
                  >
                    {entry.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      href={`/dashboard/projects/${projectId}/entries/${entry.id}`}
                    >
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
