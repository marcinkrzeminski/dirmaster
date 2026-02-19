export type EntryStatus = "draft" | "published" | "archived";
export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface Owner {
  id: string;
  email: string;
  name?: string;
  createdAt: number;
}

export interface ProjectSettings {
  theme?: ThemeConfig;
  submissionForm?: SubmissionFormConfig;
  seo?: SeoConfig;
  webhookUrl?: string;
  logo?: string;
  favicon?: string;
  customCss?: string;
}

export interface ThemeConfig {
  template: "minimal" | "bold" | "classic";
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  fonts: {
    body: string;
    heading: string;
  };
  spacing: "compact" | "normal" | "relaxed";
  borderRadius: "none" | "small" | "medium" | "large";
}

export interface SubmissionFormField {
  name: string;
  label: string;
  type: "text" | "email" | "url" | "textarea" | "file";
  required: boolean;
  placeholder?: string;
}

export interface SubmissionFormConfig {
  fields: SubmissionFormField[];
  successMessage?: string;
}

export interface SeoConfig {
  defaultTitle?: string;
  titleTemplate?: string;
  defaultDescription?: string;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  domain?: string;
  settings: ProjectSettings;
  createdAt: number;
}

export interface Entry {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  content: string;
  status: EntryStatus;
  metadata: Record<string, unknown>;
  imageUrl?: string;
  createdAt: number;
  publishedAt?: number;
}

export interface Submission {
  id: string;
  projectId: string;
  data: Record<string, unknown>;
  status: SubmissionStatus;
  rejectionReason?: string;
  createdAt: number;
}
