// Supabase Storage helpers — used by /admin/media + /api/admin/upload.
// Single bucket "article-media" with public read; writes use the
// service key from the server only.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET = "article-media";

export const storageEnabled = Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY);

export type StoredFile = {
  name: string;
  url: string;
  size?: number;
  contentType?: string;
  createdAt?: string;
};

function publicUrlFor(objectPath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objectPath}`;
}

export async function uploadToStorage(
  objectPath: string,
  body: ArrayBuffer | Uint8Array | Buffer,
  contentType: string
): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!storageEnabled) {
    return { ok: false, error: "Storage env not configured" };
  }
  try {
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURI(objectPath)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: body as BodyInit,
      }
    );
    if (!res.ok) {
      const error = await res.text();
      return { ok: false, error: error || `HTTP ${res.status}` };
    }
    return { ok: true, url: publicUrlFor(objectPath) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "upload failed" };
  }
}

export async function listStorageFiles(
  prefix: string
): Promise<{ ok: boolean; files?: StoredFile[]; error?: string }> {
  if (!storageEnabled) {
    return { ok: false, error: "Storage env not configured" };
  }
  try {
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prefix,
          limit: 200,
          sortBy: { column: "created_at", order: "desc" },
        }),
      }
    );
    if (!res.ok) {
      const error = await res.text();
      return { ok: false, error: error || `HTTP ${res.status}` };
    }
    const data = (await res.json()) as {
      name: string;
      id?: string;
      created_at?: string;
      metadata?: { size?: number; mimetype?: string };
    }[];
    const files: StoredFile[] = data
      .filter((f) => f.name && !f.name.endsWith("/"))
      .map((f) => ({
        name: f.name,
        url: publicUrlFor(`${prefix}/${f.name}`),
        size: f.metadata?.size,
        contentType: f.metadata?.mimetype,
        createdAt: f.created_at,
      }));
    return { ok: true, files };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "list failed" };
  }
}

export async function deleteStorageFile(
  objectPath: string
): Promise<{ ok: boolean; error?: string }> {
  if (!storageEnabled) {
    return { ok: false, error: "Storage env not configured" };
  }
  try {
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURI(objectPath)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
      }
    );
    if (!res.ok) {
      const error = await res.text();
      return { ok: false, error: error || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "delete failed" };
  }
}

export function sanitizeSlug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80);
}

export function sanitizeFilename(input: string): string {
  // Replace whitespace + parens; keep letters, numbers, ._-
  return input
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 120);
}

export function articleObjectPath(slug: string, filename: string): string {
  return `articles/${sanitizeSlug(slug)}/${sanitizeFilename(filename)}`;
}

export function articlePrefix(slug: string): string {
  return `articles/${sanitizeSlug(slug)}`;
}
