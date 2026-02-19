import { i } from "@instantdb/react";

/**
 * InstantDB schema definition.
 *
 * Push this schema to InstantDB using the InstantDB dashboard
 * or the CLI: npx instant-cli@latest push schema
 */
const schema = i.schema({
  entities: {
    owners: i.entity({
      email: i.string().unique().indexed(),
      name: i.string().optional(),
      createdAt: i.number().indexed(),
    }),
    projects: i.entity({
      ownerId: i.string().indexed(),
      name: i.string(),
      slug: i.string().indexed(),
      domain: i.string().optional(),
      settings: i.json().optional(),
      createdAt: i.number().indexed(),
    }),
    entries: i.entity({
      projectId: i.string().indexed(),
      title: i.string(),
      slug: i.string().indexed(),
      content: i.string(),
      status: i.string().indexed(), // "draft" | "published" | "archived"
      metadata: i.json().optional(),
      imageUrl: i.string().optional(),
      createdAt: i.number().indexed(),
      publishedAt: i.number().optional(),
    }),
    submissions: i.entity({
      projectId: i.string().indexed(),
      data: i.json(),
      status: i.string().indexed(), // "pending" | "approved" | "rejected"
      rejectionReason: i.string().optional(),
      createdAt: i.number().indexed(),
    }),
  },
  links: {
    projectOwner: {
      forward: { on: "projects", has: "one", label: "owner" },
      reverse: { on: "owners", has: "many", label: "projects" },
    },
    entryProject: {
      forward: { on: "entries", has: "one", label: "project" },
      reverse: { on: "projects", has: "many", label: "entries" },
    },
    submissionProject: {
      forward: { on: "submissions", has: "one", label: "project" },
      reverse: { on: "projects", has: "many", label: "submissions" },
    },
  },
});

export default schema;
export type AppSchema = typeof schema;
