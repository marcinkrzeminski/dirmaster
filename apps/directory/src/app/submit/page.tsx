import { getProject } from "@/lib/data";
import { SubmissionForm } from "@/components/SubmissionForm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const project = await getProject();
  return {
    title: `Submit to ${project?.name ?? "Directory"}`,
    description: `Submit your listing to ${project?.name ?? "our directory"}.`,
  };
}

export default async function SubmitPage() {
  const project = await getProject();
  if (!project) notFound();

  const formConfig = (
    project.settings?.submissionForm as {
      fields?: Array<{
        name: string;
        label: string;
        type: string;
        required: boolean;
        placeholder?: string;
      }>;
      successMessage?: string;
    }
  ) ?? {};

  const fields = formConfig.fields ?? [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "Your name or company" },
    { name: "url", label: "Website URL", type: "url", required: true, placeholder: "https://example.com" },
    { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Tell us about your project" },
    { name: "email", label: "Contact Email", type: "email", required: true, placeholder: "hello@example.com" },
  ];

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ fontFamily: "var(--theme-font-heading)" }}
      >
        Submit a Listing
      </h1>
      <p className="text-sm opacity-60 mb-8">
        Submit your project to be featured in {project.name}.
      </p>
      <SubmissionForm
        projectId={project.id}
        fields={fields}
        successMessage={formConfig.successMessage ?? "Thank you! Your submission is under review."}
      />
    </main>
  );
}
