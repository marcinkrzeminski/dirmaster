"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEntrySchema, type CreateEntryInput, slugify } from "shared";
import { Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui";

interface EntryFormProps {
  defaultValues?: Partial<CreateEntryInput>;
  onSubmit: (data: CreateEntryInput) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
}

export function EntryForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Save",
}: EntryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEntryInput>({
    resolver: zodResolver(createEntrySchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      status: "draft",
      metadata: {},
      imageUrl: "",
      ...defaultValues,
    },
  });

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    setValue("title", title);
    if (!defaultValues?.slug) {
      setValue("slug", slugify(title));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Entry title"
          {...register("title")}
          onChange={handleTitleChange}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" placeholder="entry-slug" {...register("slug")} />
        {errors.slug && (
          <p className="text-sm text-destructive">{errors.slug.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL (optional)</Label>
        <Input id="imageUrl" placeholder="https://..." {...register("imageUrl")} />
        {errors.imageUrl && (
          <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          defaultValue={defaultValues?.status ?? "draft"}
          onValueChange={(v) => setValue("status", v as CreateEntryInput["status"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          placeholder="Entry content (Markdown supported)"
          className="min-h-[300px] font-mono text-sm"
          {...register("content")}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
