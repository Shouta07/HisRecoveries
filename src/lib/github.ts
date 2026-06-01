// Minimal GitHub REST API client used by the /admin editor.
// Reads + writes a single markdown file in the repo at a time;
// commits are made by a fine-grained PAT scoped to this repo with
// "Contents: read+write".

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // e.g. "Shouta07/HisRecoveries"
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? "main";

export const githubEnabled = Boolean(GITHUB_TOKEN && GITHUB_REPO);

type GhFileResponse = {
  type: "file";
  sha: string;
  path: string;
  content: string; // base64
  encoding: "base64";
};

/** Read a file from the repo. Returns sha + decoded content. */
export async function readFile(
  path: string
): Promise<{ ok: boolean; sha?: string; content?: string; error?: string }> {
  if (!githubEnabled) return { ok: false, error: "GitHub env not configured" };
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${encodeURI(path)}?ref=${GITHUB_BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      }
    );
    if (res.status === 404) return { ok: false, error: "file not found" };
    if (!res.ok) {
      const error = await res.text();
      return { ok: false, error: error || `HTTP ${res.status}` };
    }
    const data = (await res.json()) as GhFileResponse;
    const content = Buffer.from(data.content, "base64").toString("utf8");
    return { ok: true, sha: data.sha, content };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "read failed" };
  }
}

/** Create or update a file. Provide sha when updating. */
export async function writeFile(
  path: string,
  content: string,
  message: string,
  opts: { sha?: string } = {}
): Promise<{ ok: boolean; commit?: string; error?: string }> {
  if (!githubEnabled) return { ok: false, error: "GitHub env not configured" };
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${encodeURI(path)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          branch: GITHUB_BRANCH,
          content: Buffer.from(content, "utf8").toString("base64"),
          ...(opts.sha ? { sha: opts.sha } : {}),
        }),
      }
    );
    if (!res.ok) {
      const error = await res.text();
      return { ok: false, error: error || `HTTP ${res.status}` };
    }
    const data = (await res.json()) as { commit?: { sha?: string } };
    return { ok: true, commit: data.commit?.sha };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "write failed" };
  }
}

/** Delete a file (requires sha). */
export async function deleteFile(
  path: string,
  sha: string,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  if (!githubEnabled) return { ok: false, error: "GitHub env not configured" };
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${encodeURI(path)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          branch: GITHUB_BRANCH,
          sha,
        }),
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
