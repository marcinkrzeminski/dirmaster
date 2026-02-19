import { init } from "@instantdb/react";
import schema from "./schema";

/**
 * Browser/React client for InstantDB.
 * Use in Client Components in HQ app.
 */
export function createClient(appId: string) {
  return init({ appId, schema });
}

/**
 * Singleton client — initialized lazily.
 * Reads NEXT_PUBLIC_INSTANTDB_APP_ID from env.
 */
let _client: ReturnType<typeof createClient> | null = null;

export function getClient(): ReturnType<typeof createClient> {
  if (!_client) {
    const appId = process.env.NEXT_PUBLIC_INSTANTDB_APP_ID;
    if (!appId) {
      throw new Error("NEXT_PUBLIC_INSTANTDB_APP_ID is not set");
    }
    _client = createClient(appId);
  }
  return _client;
}
