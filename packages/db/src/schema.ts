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
      status: i.string().indexed(), // "draft" | "published" | "archived" | "pending" | "rejected"
      metadata: i.json().optional(),
      imageUrl: i.string().optional(),
      rejectionReason: i.string().optional(),
      createdAt: i.number().indexed(),
      publishedAt: i.number().optional(),
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
  },
});

export default schema;
export type AppSchema = typeof schema;
