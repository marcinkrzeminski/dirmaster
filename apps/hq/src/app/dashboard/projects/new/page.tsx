"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { db } from "@/lib/db";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { createProjectSchema, type CreateProjectInput, slugify } from "shared";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from "ui";
import { id } from "@instantdb/react";

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", slug: "", domain: "" },
  });

  const nameValue = watch("name");

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setValue("name", name);
    setValue("slug", slugify(name));
  }

  async function onSubmit(data: CreateProjectInput) {
    if (!user) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const projectId = id();
      await db.transact([
        db.tx.projects[projectId].update({
          ownerId: user.id,
          name: data.name,
          slug: data.slug,
          domain: data.domain || undefined,
          settings: {},
          createdAt: Date.now(),
        }),
      ]);
      router.push(`/dashboard/projects/${projectId}/entries`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
        <p className="text-muted-foreground">Create a new directory site</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My Directory"
                {...register("name")}
                onChange={handleNameChange}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="my-directory" {...register("slug")} />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Used as the project identifier. Lowercase letters, numbers, and hyphens only.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Custom domain (optional)</Label>
              <Input id="domain" placeholder="directory.example.com" {...register("domain")} />
              {errors.domain && (
                <p className="text-sm text-destructive">{errors.domain.message}</p>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
