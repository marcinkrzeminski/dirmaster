"use client";

import { useState } from "react";

interface Field {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
}

interface SubmissionFormProps {
  projectId: string;
  fields: Field[];
  successMessage: string;
}

export function SubmissionForm({ projectId, fields, successMessage }: SubmissionFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    for (const field of fields) {
      data[field.name] = (formData.get(field.name) as string) || "";
    }

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, data }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? "Submission failed");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <p className="text-xl font-semibold" style={{ color: "var(--theme-primary)" }}>
          ✓ Submitted!
        </p>
        <p className="mt-2 opacity-70">{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot */}
      <input type="text" name="_hp" className="hidden" tabIndex={-1} autoComplete="off" />

      {fields.map((field) => (
        <div key={field.name} className="space-y-1.5">
          <label className="text-sm font-medium block" htmlFor={field.name}>
            {field.label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          {field.type === "textarea" ? (
            <textarea
              id={field.name}
              name={field.name}
              required={field.required}
              placeholder={field.placeholder}
              rows={4}
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "var(--theme-primary)" } as React.CSSProperties}
            />
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "var(--theme-primary)" } as React.CSSProperties}
            />
          )}
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: "var(--theme-primary)" }}
      >
        {isSubmitting ? "Submitting..." : "Submit Listing"}
      </button>
    </form>
  );
}
