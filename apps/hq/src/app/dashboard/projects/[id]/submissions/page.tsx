"use client";

import { use, useState } from "react";
import { db } from "@/lib/db";
import { Button, Badge, Card, CardContent } from "ui";
import { id } from "@instantdb/react";
import type { SubmissionStatus } from "shared";

const STATUS_VARIANTS = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
} as const;

export default function SubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const [filter, setFilter] = useState<SubmissionStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = db.useQuery({
    projects: { $: { where: { id: projectId } } },
    submissions: { $: { where: { projectId } } },
  });

  const project = data?.projects?.[0];
  const allSubmissions = data?.submissions ?? [];
  const submissions =
    filter === "all" ? allSubmissions : allSubmissions.filter((s) => s.status === filter);

  async function handleApprove(submission: (typeof allSubmissions)[0]) {
    const submissionData = submission.data as Record<string, unknown>;
    const entryId = id();
    const title =
      (submissionData.name as string) ||
      (submissionData.title as string) ||
      `Submission ${entryId.slice(0, 6)}`;

    await db.transact([
      db.tx.submissions[submission.id].update({ status: "approved" }),
      db.tx.entries[entryId].update({
        projectId,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        content: JSON.stringify(submissionData, null, 2),
        status: "draft",
        metadata: submissionData,
        createdAt: Date.now(),
      }),
    ]);
  }

  async function handleReject(submissionId: string) {
    await db.transact([
      db.tx.submissions[submissionId].update({
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
          {project?.name ?? "Project"} — Submissions
        </h1>
        <p className="text-muted-foreground">{allSubmissions.length} total submissions</p>
      </div>

      <div className="flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
          >
            {s}
            {s === "pending" && allSubmissions.filter((x) => x.status === "pending").length > 0 && (
              <span className="ml-1.5 rounded-full bg-yellow-200 px-1.5 py-0.5 text-xs text-yellow-800">
                {allSubmissions.filter((x) => x.status === "pending").length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No submissions{filter !== "all" ? ` with status "${filter}"` : ""}.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => {
            const submissionData = submission.data as Record<string, unknown>;
            const isExpanded = expandedId === submission.id;

            return (
              <Card key={submission.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={STATUS_VARIANTS[submission.status as SubmissionStatus]}>
                          {submission.status as string}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(submission.createdAt as number).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-2 text-sm">
                        {Object.entries(submissionData)
                          .slice(0, 3)
                          .map(([k, v]) => (
                            <span key={k} className="mr-4 text-muted-foreground">
                              <span className="font-medium text-foreground">{k}:</span>{" "}
                              {String(v).slice(0, 60)}
                            </span>
                          ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedId(isExpanded ? null : submission.id)}
                      >
                        {isExpanded ? "Collapse" : "View"}
                      </Button>
                      {submission.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(submission)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-red-50"
                            onClick={() => setExpandedId(submission.id)}
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
                        {JSON.stringify(submissionData, null, 2)}
                      </pre>
                      {submission.status === "pending" && (
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
                            onClick={() => handleReject(submission.id)}
                          >
                            Confirm Reject
                          </Button>
                        </div>
                      )}
                      {submission.rejectionReason && (
                        <p className="mt-2 text-sm text-destructive">
                          Reason: {submission.rejectionReason as string}
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
