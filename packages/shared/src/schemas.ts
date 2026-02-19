import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  domain: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createEntrySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  content: z.string().default(""),
  status: z.enum(["draft", "published", "archived", "pending", "rejected"]).default("draft"),
  metadata: z.record(z.unknown()).default({}),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const updateEntrySchema = createEntrySchema.partial();

export const themeConfigSchema = z.object({
  template: z.enum(["minimal", "bold", "classic"]).default("minimal"),
  colors: z.object({
    primary: z.string().default("#3b82f6"),
    secondary: z.string().default("#6b7280"),
    accent: z.string().default("#f59e0b"),
    background: z.string().default("#ffffff"),
    foreground: z.string().default("#111827"),
  }),
  fonts: z.object({
    body: z.string().default("Inter"),
    heading: z.string().default("Inter"),
  }),
  spacing: z.enum(["compact", "normal", "relaxed"]).default("normal"),
  borderRadius: z.enum(["none", "small", "medium", "large"]).default("medium"),
});

export const submissionFormFieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "email", "url", "textarea", "file"]),
  required: z.boolean(),
  placeholder: z.string().optional(),
});

export const projectSettingsSchema = z.object({
  theme: themeConfigSchema.optional(),
  submissionForm: z
    .object({
      fields: z.array(submissionFormFieldSchema),
      successMessage: z.string().optional(),
    })
    .optional(),
  seo: z
    .object({
      defaultTitle: z.string().optional(),
      titleTemplate: z.string().optional(),
      defaultDescription: z.string().optional(),
    })
    .optional(),
  webhookUrl: z.string().url().optional().or(z.literal("")),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  customCss: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
export type ThemeConfigInput = z.infer<typeof themeConfigSchema>;
export type ProjectSettingsInput = z.infer<typeof projectSettingsSchema>;
