import { ImageResponse } from "next/og";

// The social-preview card for every page (link shares on LinkedIn,
// X, Slack, etc.) — generated in the site's own palette, like icon.tsx.
export const alt = "Viswesh Kesarla — build. learn. capture.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#080807",
          backgroundImage:
            "linear-gradient(to right, rgba(245,245,240,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,245,240,0.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          color: "#f5f5f0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 3, color: "#a6a49c" }}>
          <span>VISWESH KESARLA</span>
          <span>HYDERABAD, INDIA</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontSize: 96, fontWeight: 700, lineHeight: 0.95, letterSpacing: -2 }}>
          <span>BUILD.</span>
          <span>LEARN.</span>
          <span style={{ color: "#e8a33d" }}>CAPTURE.</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 3, color: "#a6a49c" }}>
          <span>AI / SOFTWARE / PHOTOGRAPHY</span>
          <span>RAG · LLMS · PYTHON</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
