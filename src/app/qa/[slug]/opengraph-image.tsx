import { ImageResponse } from "next/og";
import { getQA } from "@/lib/qa";
import { TERRITORY_LABEL } from "@/lib/feelings";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const alt = "His Recoveries — Q&A";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const q = await getQA(params.slug);
  const question = q ? `Q. ${q.question}` : site.name;
  const territory = q ? TERRITORY_LABEL[q.territory] ?? q.territory : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F7F1E3",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            color: "#221A11",
            letterSpacing: "0.05em",
            fontWeight: 300,
            display: "flex",
          }}
        >
          {site.name}
        </div>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 22,
              color: "#8E6A36",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Recovery Q&A {territory ? `· ${territory}` : ""}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 56,
              color: "#221A11",
              lineHeight: 1.4,
              letterSpacing: "0.01em",
              display: "flex",
              maxWidth: 1040,
            }}
          >
            {question}
          </div>
        </div>
        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid #D8CBB0",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 18,
            color: "#8E6A36",
            letterSpacing: "0.2em",
          }}
        >
          <div style={{ display: "flex" }}>HISRECOVERIES.COM/QA</div>
          <div style={{ display: "flex" }}>RECOVER YOUR PRESENCE</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
