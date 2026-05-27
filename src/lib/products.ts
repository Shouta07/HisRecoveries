import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

const PRODUCTS_DIR = path.join(process.cwd(), "content", "products");

// Provider-agnostic affiliate links. Add only the ones registered.
export type ProductLinks = {
  amazon?: string;
  rakuten?: string;
  asp?: string; // A8 / もしも / その他 ASP の汎用リンク
};

export type ProductFrontmatter = {
  title: string;
  slug: string;
  territory: string; // 関連する地形図 (sweat-odor など)
  productType: string; // 「デオドラント」「制汗剤」などの種別ラベル
  excerpt: string;
  note?: string; // 正直な一言メモ
  priceRange?: string;
  links: ProductLinks;
  order: number;
  status?: "draft" | "published";
};

export type ProductDetail = ProductFrontmatter & {
  contentHtml: string;
};

function ensureDir() {
  if (!fs.existsSync(PRODUCTS_DIR)) {
    fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
  }
}

function readAllFiles(): string[] {
  ensureDir();
  return fs
    .readdirSync(PRODUCTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .filter((f) => !f.startsWith("_")); // _template.md などは除外
}

function parseFile(filename: string) {
  const raw = fs.readFileSync(path.join(PRODUCTS_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  const slug = (data.slug as string) ?? filename.replace(/\.mdx?$/, "");
  const links: ProductLinks = {
    amazon: data.links?.amazon || undefined,
    rakuten: data.links?.rakuten || undefined,
    asp: data.links?.asp || undefined,
  };
  const fm: ProductFrontmatter = {
    title: data.title ?? slug,
    slug,
    territory: data.territory ?? "",
    productType: data.productType ?? "",
    excerpt: data.excerpt ?? "",
    note: data.note,
    priceRange: data.priceRange,
    links,
    order: data.order ?? 99,
    status: data.status ?? "published",
  };
  return { fm, content };
}

export function hasAnyLink(links: ProductLinks): boolean {
  return Boolean(links.amazon || links.rakuten || links.asp);
}

export function getAllProducts(): ProductFrontmatter[] {
  return readAllFiles()
    .map((f) => parseFile(f).fm)
    .filter((p) => p.status !== "draft")
    .filter((p) => hasAnyLink(p.links)) // リンク未登録の商品は公開しない
    .sort((a, b) => a.order - b.order);
}

export function getProductsByTerritory(territory: string): ProductFrontmatter[] {
  return getAllProducts().filter((p) => p.territory === territory);
}

export async function getProduct(slug: string): Promise<ProductDetail | null> {
  const file = readAllFiles().find((f) => parseFile(f).fm.slug === slug);
  if (!file) return null;
  const { fm, content } = parseFile(file);
  const html = (
    await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(content)
  ).toString();
  return { ...fm, contentHtml: html };
}
