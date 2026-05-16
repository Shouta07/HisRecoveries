import { ImageResponse } from "next/og";
import { getArticle } from "@/lib/articles";
import { categoryLabel, site } from "@/lib/site";
import { formatDate } from "@/lib/articles";

export const runtime = "nodejs";
export const alt = "His Recoveries article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  const title = article?.title ?? site.name;
  const category = article ? categoryLabel(article.category) : "";
  const date = article ? formatDate(article.publishedAt) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAFAF7",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#1A1A1A",
            letterSpacing: "0.05em",
            fontWeight: 300,
            display: "flex",
          }}
        >
          {site.name}
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {category && (
            <div
              style={{
                fontSize: 22,
                color: "#6B6B6B",
                letterSpacing: "0.2em",
                display: "flex",
              }}
            >
              {category}
              {date ? `  ·  ${date}` : ""}
            </div>
          )}

          <div
            style={{
              marginTop: 28,
              fontSize: 56,
              color: "#1A1A1A",
              lineHeight: 1.4,
              letterSpacing: "0.02em",
              display: "flex",
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid #E5E5E0",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 18,
            color: "#8B7355",
            letterSpacing: "0.2em",
          }}
        >
          <div style={{ display: "flex" }}>NAGI</div>
          <div style={{ display: "flex" }}>HISRECOVERIES.COM</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
