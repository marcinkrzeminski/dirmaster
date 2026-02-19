"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { type CreateEntryInput } from "shared";
import { invalidateEntryCache, setCachedEntry } from "cache";
import { EntryForm } from "@/components/EntryForm";
import { id } from "@instantdb/react";
import type { Entry } from "shared";

export default function NewEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: CreateEntryInput) {
    setIsSubmitting(true);
    setError(null);

    try {
      const entryId = id();
      const now = Date.now();
      const entry: Entry = {
        id: entryId,
        projectId,
        title: data.title,
        slug: data.slug,
        content: data.content,
        status: data.status,
        metadata: data.metadata,
        imageUrl: data.imageUrl || undefined,
        createdAt: now,
        publishedAt: data.status === "published" ? now : undefined,
      };

      await db.transact([
        db.tx.entries[entryId].update({
          projectId,
          title: entry.title,
          slug: entry.slug,
          content: entry.content,
          status: entry.status,
          metadata: entry.metadata,
          imageUrl: entry.imageUrl,
          createdAt: entry.createdAt,
          publishedAt: entry.publishedAt,
        }),
      ]);

      if (entry.status === "published") {
        await setCachedEntry(entry);
      }
      await invalidateEntryCache(projectId, entry.slug);

      router.push(`/dashboard/projects/${projectId}/entries`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create entry");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">New Entry</h1>
        <p className="text-muted-foreground">Create a new directory entry</p>
      </div>
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      <EntryForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="Create Entry" />
    </div>
  );
}
