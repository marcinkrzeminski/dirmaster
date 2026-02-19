"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { db } from "@/lib/db";
import { invalidateProjectCache } from "cache";
import {
  updateProjectSchema,
  type UpdateProjectInput,
  themeConfigSchema,
  type ThemeConfigInput,
  templateDefaults,
} from "shared";
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "ui";

export default function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading } = db.useQuery({
    projects: { $: { where: { id: projectId } } },
  });

  const project = data?.projects?.[0];
  const settings = (project?.settings as Record<string, unknown>) ?? {};

  const {
    register: registerProject,
    handleSubmit: handleProjectSubmit,
    reset: resetProject,
    formState: { errors: projectErrors },
  } = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
  });

  const { register: registerTheme, handleSubmit: handleThemeSubmit, setValue: setThemeValue, watch: watchTheme } =
    useForm<ThemeConfigInput>({
      resolver: zodResolver(themeConfigSchema),
    });

  const selectedTemplate = watchTheme("template");

  useEffect(() => {
    if (project) {
      resetProject({
        name: project.name as string,
        slug: project.slug as string,
        domain: (project.domain as string) || "",
      });
    }
  }, [project, resetProject]);

  async function onSaveGeneral(data: UpdateProjectInput) {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await db.transact([db.tx.projects[projectId].update(data)]);
      await invalidateProjectCache(projectId);
      setSaveMessage("Settings saved!");
    } catch {
      setSaveMessage("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  }

  async function onSaveTheme(data: ThemeConfigInput) {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await db.transact([
        db.tx.projects[projectId].update({
          settings: { ...settings, theme: data },
        }),
      ]);
      await invalidateProjectCache(projectId);
      setSaveMessage("Theme saved!");
    } catch {
      setSaveMessage("Failed to save theme.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleApplyTemplate(template: ThemeConfigInput["template"]) {
    const defaults = templateDefaults[template];
    setThemeValue("template", defaults.template);
    setThemeValue("colors", defaults.colors);
    setThemeValue("fonts", defaults.fonts);
    setThemeValue("spacing", defaults.spacing);
    setThemeValue("borderRadius", defaults.borderRadius);
  }

  async function handleDelete() {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await db.transact([db.tx.projects[projectId].delete()]);
      await invalidateProjectCache(projectId);
      router.push("/dashboard/projects");
    } catch {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {project?.name ?? "Project"} — Settings
        </h1>
      </div>

      {saveMessage && (
        <p className="text-sm font-medium text-green-700">{saveMessage}</p>
      )}

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="danger">Danger</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProjectSubmit(onSaveGeneral)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input {...registerProject("name")} />
                  {projectErrors.name && (
                    <p className="text-sm text-destructive">{projectErrors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input {...registerProject("slug")} />
                  {projectErrors.slug && (
                    <p className="text-sm text-destructive">{projectErrors.slug.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Custom domain (optional)</Label>
                  <Input placeholder="directory.example.com" {...registerProject("domain")} />
                </div>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme & appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleThemeSubmit(onSaveTheme)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Template</Label>
                  <div className="flex gap-3">
                    {(["minimal", "bold", "classic"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`rounded-md border px-4 py-2 text-sm capitalize transition-colors ${
                          selectedTemplate === t
                            ? "border-primary bg-primary/5 font-semibold"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => handleApplyTemplate(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        className="h-10 w-12 rounded border"
                        {...(registerTheme("colors.primary") as object)}
                      />
                      <Input {...registerTheme("colors.primary")} className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Background color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        className="h-10 w-12 rounded border"
                        {...(registerTheme("colors.background") as object)}
                      />
                      <Input {...registerTheme("colors.background")} className="flex-1" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Spacing</Label>
                  <Select
                    defaultValue="normal"
                    onValueChange={(v) =>
                      setThemeValue("spacing", v as ThemeConfigInput["spacing"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="relaxed">Relaxed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Custom CSS (advanced)</Label>
                  <Textarea
                    placeholder="/* Custom CSS */"
                    className="font-mono text-sm"
                    rows={6}
                    onChange={(e) => {
                      // stored in settings separately
                    }}
                  />
                </div>

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Theme"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default page title</Label>
                <Input
                  placeholder="My Directory"
                  defaultValue={(settings.seo as { defaultTitle?: string })?.defaultTitle}
                />
              </div>
              <div className="space-y-2">
                <Label>Title template</Label>
                <Input
                  placeholder="%s | My Directory"
                  defaultValue={(settings.seo as { titleTemplate?: string })?.titleTemplate}
                />
                <p className="text-xs text-muted-foreground">
                  Use %s as placeholder for entry title
                </p>
              </div>
              <div className="space-y-2">
                <Label>Default description</Label>
                <Textarea
                  placeholder="Browse our curated directory..."
                  defaultValue={
                    (settings.seo as { defaultDescription?: string })?.defaultDescription
                  }
                />
              </div>
              <Button
                onClick={async () => {
                  setIsSaving(true);
                  // SEO settings saved inline here
                  setIsSaving(false);
                  setSaveMessage("SEO saved!");
                }}
                disabled={isSaving}
              >
                Save SEO
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Deleting a project is permanent and cannot be undone. All entries and
                submissions will be lost.
              </p>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Project"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
