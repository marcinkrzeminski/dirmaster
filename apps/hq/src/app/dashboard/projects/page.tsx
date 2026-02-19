"use client";

import Link from "next/link";
import { db } from "@/lib/db";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Card, CardContent, Button, Badge } from "ui";
import { Plus, Settings, FileText, Inbox, ExternalLink } from "lucide-react";

export default function ProjectsPage() {
  const { user } = useCurrentUser();

  const { data, isLoading } = db.useQuery(
    user
      ? {
          projects: {
            $: { where: { ownerId: user.id } },
            entries: {},
            submissions: {},
          },
        }
      : null
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const projects = data?.projects ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">All your directory sites</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="mb-4 text-muted-foreground">No projects yet.</p>
            <Button asChild>
              <Link href="/dashboard/projects/new">Create your first project</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const entriesCount = project.entries?.length ?? 0;
            const pendingSubmissions =
              project.submissions?.filter((s) => s.status === "pending").length ?? 0;

            return (
              <Card key={project.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{project.name}</span>
                      {pendingSubmissions > 0 && (
                        <Badge variant="warning">{pendingSubmissions} pending</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span>/{project.slug}</span>
                      {project.domain && (
                        <span className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          {project.domain}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {entriesCount} entries
                      </span>
                      <span className="flex items-center gap-1">
                        <Inbox className="h-3 w-3" />
                        {pendingSubmissions} pending
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/projects/${project.id}/entries`}>Entries</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/projects/${project.id}/submissions`}>
                        Submissions
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/projects/${project.id}/settings`}>
                        <Settings className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
