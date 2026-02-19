"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { type CreateEntryInput } from "shared";
import { invalidateEntryCache, setCachedEntry } from "cache";
import { EntryForm } from "@/components/EntryForm";
import type { Entry } from "shared";

export default function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string; entryId: string }>;
}) {
  const { id: projectId, entryId } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = db.useQuery({
    entries: { $: { where: { id: entryId } } },
  });

  const entry = data?.entries?.[0];

  async function handleSubmit(data: CreateEntryInput) {
    if (!entry) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedEntry: Entry = {
        id: entryId,
        projectId,
        title: data.title,
        slug: data.slug,
        content: data.content,
        status: data.status,
        metadata: data.metadata,
        imageUrl: data.imageUrl || undefined,
        createdAt: entry.createdAt as number,
        publishedAt:
          data.status === "published"
            ? (entry.publishedAt as number | undefined) ?? Date.now()
            : undefined,
      };

      await db.transact([
        db.tx.entries[entryId].update({
          title: updatedEntry.title,
          slug: updatedEntry.slug,
          content: updatedEntry.content,
          status: updatedEntry.status,
          metadata: updatedEntry.metadata,
          imageUrl: updatedEntry.imageUrl,
          publishedAt: updatedEntry.publishedAt,
        }),
      ]);

      // Invalidate old slug if changed
      if (entry.slug !== data.slug) {
        await invalidateEntryCache(projectId, entry.slug as string);
      }

      if (updatedEntry.status === "published") {
        await setCachedEntry(updatedEntry);
      } else {
        await invalidateEntryCache(projectId, updatedEntry.slug);
      }

      router.push(`/dashboard/projects/${projectId}/entries`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update entry");
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!entry) {
    return <p className="text-muted-foreground">Entry not found.</p>;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Entry</h1>
        <p className="text-muted-foreground">{entry.title as string}</p>
      </div>
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      <EntryForm
        defaultValues={{
          title: entry.title as string,
          slug: entry.slug as string,
          content: entry.content as string,
          status: entry.status as CreateEntryInput["status"],
          imageUrl: (entry.imageUrl as string) || "",
          metadata: (entry.metadata as Record<string, unknown>) || {},
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Save Changes"
      />
    </div>
  );
}
