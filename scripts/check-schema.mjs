// supabase/schema.sql と、コードが実際に読み書きする列を突き合わせる。
//
// ── なぜ要るか ────────────────────────────────────
// payments の列名がコードと schema でずれていて、
//   create index ... (payment_status)  → schema.sql がそこで止まる
//   insert { amount, payment_status }  → 列が無くて全部失敗
// つまり「決済が1件も通らない」状態のまま、ビルドは緑だった。
// 型はテーブルまで届かないので、ここで突き合わせる。
//
// 完全な SQL パーサではない。この repo が使う書き方だけ見る。
//   create table [if not exists] X ( ... )
//   alter table X add column [if not exists] Y ...
//   create [or replace] view X as ...
// コード側は PostgREST の URL と dbInsert/dbUpdate の対象を見る。

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sql = fs.readFileSync(path.join(root, "supabase", "schema.sql"), "utf8");

/* ── schema.sql から、テーブルごとの列を集める ─────────── */
const tables = new Map(); // name -> Set(columns)
const views = new Set();

for (const m of sql.matchAll(
  /create\s+table\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z0-9_]*)\s*\(([\s\S]*?)\n\);/gi,
)) {
  const [, name, body] = m;
  const cols = new Set();
  for (const line of body.split("\n")) {
    const t = line.trim().replace(/--.*$/, "").trim();
    if (!t) continue;
    if (/^(primary|unique|foreign|constraint|check|exclude)\b/i.test(t)) continue;
    const c = t.match(/^([a-z_][a-z0-9_]*)\s+/i);
    if (c) cols.add(c[1].toLowerCase());
  }
  tables.set(name.toLowerCase(), cols);
}

for (const m of sql.matchAll(
  /alter\s+table\s+([a-z_][a-z0-9_]*)\s+add\s+column\s+(?:if\s+not\s+exists\s+)?([a-z_][a-z0-9_]*)/gi,
)) {
  const t = m[1].toLowerCase();
  if (!tables.has(t)) tables.set(t, new Set());
  tables.get(t).add(m[2].toLowerCase());
}

for (const m of sql.matchAll(/create\s+(?:or\s+replace\s+)?view\s+([a-z_][a-z0-9_]*)/gi)) {
  views.add(m[1].toLowerCase());
}

/* ── SQL 自身の中の食い違い（ビューやインデックスが無い列を指す）── */
const problems = [];

for (const m of sql.matchAll(
  /create\s+(?:unique\s+)?index\s+(?:if\s+not\s+exists\s+)?[a-z0-9_]+\s+on\s+([a-z_][a-z0-9_]*)\s*\(([^)]*)\)/gi,
)) {
  const t = m[1].toLowerCase();
  const cols = tables.get(t);
  if (!cols) continue;
  for (const raw of m[2].split(",")) {
    const c = raw.trim().replace(/\s+(asc|desc)$/i, "").toLowerCase();
    if (!/^[a-z_][a-z0-9_]*$/.test(c)) continue;
    if (!cols.has(c)) problems.push(`索引: ${t}.${c} が存在しません（schema.sql がここで止まります）`);
  }
}

/* ── コードが使う列 ───────────────────────────────── */
function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

const RESERVED = new Set(["select", "order", "limit", "offset", "and", "or", "not"]);

for (const file of walk(path.join(root, "src"))) {
  const src = fs.readFileSync(file, "utf8");
  const rel = path.relative(root, file);

  // PostgREST の問い合わせ文字列: `table?select=a,b&col=eq.x&order=y.desc`
  for (const m of src.matchAll(/[`"']([a-z_][a-z0-9_]*)\?([^`"'\n]*)[`"']/g)) {
    const t = m[1].toLowerCase();
    const cols = tables.get(t);
    if (!cols || views.has(t)) continue;
    const q = m[2];
    const used = new Set();
    const sel = q.match(/select=([^&]*)/);
    if (sel) {
      // 埋め込み（PostgREST の join）: `consultations(category,body)` は
      // 別の表の列なので、ここでは見ない。丸ごと落としてから分解する。
      const top = sel[1].replace(/[a-z_][a-z0-9_]*\([^)]*\)/gi, "");
      for (const c of top.split(",")) used.add(c.trim().toLowerCase());
    }
    for (const f of q.matchAll(/(?:^|&)([a-z_][a-z0-9_]*)=(?:eq|neq|gt|gte|lt|lte|is|in|like|ilike|not)\./g))
      used.add(f[1].toLowerCase());
    const ord = q.match(/order=([^&]*)/);
    if (ord) for (const c of ord[1].split(",")) used.add(c.split(".")[0].trim().toLowerCase());
    for (const c of used) {
      if (!c || RESERVED.has(c) || c === "*") continue;
      if (!cols.has(c)) problems.push(`${rel}: ${t}.${c} を問い合わせていますが、列がありません`);
    }
  }

  // dbInsert / dbInsertReturning / dbUpdate("table", { ... })
  for (const m of src.matchAll(
    // 閉じ括弧の手前に型の言い換え（as unknown as Record<...>）が入ることがある。
    // 許していないと、そこで止まらずに次のオブジェクトまで読んでしまい、
    // 別の表の列を、この表の列として数えてしまう。
    /db(?:Insert|InsertReturning|Update|Upsert)[^(]*\(\s*[`"']([a-z_][a-z0-9_]*)[`"']\s*,\s*\{([\s\S]{0,900}?)\n\s*\}(?:\s+as\s+[^)]{0,120})?\s*\)/g,
  )) {
    const t = m[1].toLowerCase();
    const cols = tables.get(t);
    if (!cols) continue;
    for (const k of m[2].matchAll(/^\s*([a-z_][a-z0-9_]*)\s*:/gm)) {
      const c = k[1].toLowerCase();
      if (!cols.has(c)) problems.push(`${rel}: ${t}.${c} に書き込んでいますが、列がありません`);
    }
  }
}

const uniq = [...new Set(problems)];
if (uniq.length) {
  console.error(`\nschema.sql とコードが食い違っています（${uniq.length}件）\n`);
  for (const p of uniq) console.error("  ✗ " + p);
  console.error("\nsupabase/schema.sql を直してください。この状態で本番に出すと、その表を使う処理が全部失敗します。\n");
  process.exit(1);
}
console.log(`schema チェック: 表 ${tables.size} / ビュー ${views.size} — 食い違いなし`);
