import { init as initAdmin } from "@instantdb/admin";
import schema from "./schema";

/**
 * Server-side admin client for InstantDB.
 * Use in Server Components and API routes in Directory app.
 * Never expose INSTANTDB_ADMIN_TOKEN to the browser.
 */
export function createAdminClient() {
  const appId = process.env.INSTANTDB_APP_ID;
  const adminToken = process.env.INSTANTDB_ADMIN_TOKEN;

  if (!appId || !adminToken) {
    throw new Error("INSTANTDB_APP_ID and INSTANTDB_ADMIN_TOKEN must be set");
  }

  return initAdmin({ appId, adminToken, schema });
}

let _adminClient: ReturnType<typeof createAdminClient> | null = null;

export function getAdminClient(): ReturnType<typeof createAdminClient> {
  if (!_adminClient) {
    _adminClient = createAdminClient();
  }
  return _adminClient;
}
