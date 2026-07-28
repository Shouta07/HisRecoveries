// Minimal Supabase REST client (no SDK dependency).
// All functions gracefully no-op when env is not configured,
// so local/dev builds work without Supabase.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export const dbEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const dbAdminEnabled = Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY);

type RowPayload = Record<string, unknown>;

export async function dbInsert(
  table: string,
  row: RowPayload
): Promise<{ ok: boolean; error?: string }> {
  if (!dbEnabled) {
    // Dev / unconfigured — log and return ok so the form UX doesn't break
    console.log(`[db:noop] insert into ${table}`, row);
    return { ok: true };
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${SUPABASE_ANON_KEY!}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`[db] insert failed (${res.status})`, text);
      return { ok: false, error: text };
    }
    return { ok: true };
  } catch (e) {
    console.error("[db] insert exception", e);
    return { ok: false, error: String(e) };
  }
}

/**
 * Admin SELECT helper — uses the service key, server-only.
 * Reads a view or table via the REST API.
 */
export async function dbSelect<T = unknown>(
  pathAndQuery: string
): Promise<T[]> {
  if (!dbAdminEnabled) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${pathAndQuery}`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY!,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY!}`,
        },
        // Edge cache disabled for fresh data
        cache: "no-store",
      }
    );
    if (!res.ok) {
      console.error(
        `[db] select failed (${res.status})`,
        await res.text()
      );
      return [];
    }
    return (await res.json()) as T[];
  } catch (e) {
    console.error("[db] select exception", e);
    return [];
  }
}

/**
 * PATCH a row by id using the service key. Used by /api/admin/* to flip
 * status and write editor notes. Returns ok / error.
 */
export async function dbUpdate(
  table: string,
  id: string,
  patch: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  if (!dbAdminEnabled) {
    return { ok: false, error: "admin db not configured" };
  }
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_SERVICE_KEY!,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY!}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(patch),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      console.error(`[db] patch failed (${res.status})`, text);
      return { ok: false, error: text };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "patch failed",
    };
  }
}

/**
 * SHA-256 hash of an email (lowercased, trimmed).
 * Stored instead of raw email so we never persist PII.
 */
export async function hashEmail(email: string): Promise<string | null> {
  const clean = email.trim().toLowerCase();
  if (!clean) return null;
  try {
    const encoded = new TextEncoder().encode(clean);
    const hash = await crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return null;
  }
}

/**
 * Read the X-Attribution header forwarded by the form clients.
 * Falls back to empty if missing/malformed.
 */
export function parseAttribution(req: Request): Record<string, string> {
  const raw = req.headers.get("x-attribution");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
