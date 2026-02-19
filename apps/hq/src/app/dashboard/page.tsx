"use client";

import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "ui";
import { Plus, FolderOpen, FileText, Inbox } from "lucide-react";

export default function DashboardPage() {
  // AUTH DISABLED: load all projects without user filter
  const { data, isLoading } = db.useQuery({
    projects: {
      entries: {},
    },
  });

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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your directory sites</p>
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
            <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">No projects yet</h2>
            <p className="mb-4 text-muted-foreground">
              Create your first directory project to get started.
            </p>
            <Button asChild>
              <Link href="/dashboard/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const entriesCount = (project.entries ?? []).filter(
              (e: { status: unknown }) => e.status !== "pending" && e.status !== "rejected"
            ).length;
            const pendingSubmissions = (project.entries ?? []).filter(
              (e: { status: unknown }) => e.status === "pending"
            ).length;

            return (
              <Card key={project.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{project.name}</span>
                    {pendingSubmissions > 0 && (
                      <Badge variant="warning">{pendingSubmissions} pending</Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">/{project.slug}</p>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {entriesCount} entries
                    </span>
                    <span className="flex items-center gap-1">
                      <Inbox className="h-3.5 w-3.5" />
                      {pendingSubmissions} pending
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/dashboard/projects/${project.id}/entries`}>Entries</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/dashboard/projects/${project.id}/entries?status=pending`}>
                        Review
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
