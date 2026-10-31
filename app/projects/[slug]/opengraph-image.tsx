import { ImageResponse } from "next/og";
import { projects, getProject } from "@/data/projects";

// The link-preview card for each project page, so a shared project link
// shows that project rather than the site-wide card.
export const alt = "Project by Viswesh Kesarla";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  const title = project?.title ?? "Projects";
  const tagline = project?.tagline ?? "";
  const summary = project?.summary ?? "";
  const stack = (project?.stack ?? []).slice(0, 5);
  const inDev = project?.status === "in-development";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
          background: "#080807",
          backgroundImage:
            "linear-gradient(to right, rgba(245,245,240,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,245,240,0.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          color: "#f5f5f0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 3, color: "#a6a49c" }}>
          <span>VISWESH KESARLA · PROJECT {project?.index ?? ""}</span>
          <span style={{ color: inDev ? "#e8a33d" : "#a6a49c" }}>{inDev ? "IN DEVELOPMENT" : project?.year ?? ""}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 110, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>{title}</span>
          <span style={{ marginTop: 18, fontSize: 24, letterSpacing: 3, color: "#e8a33d" }}>{tagline}</span>
          <span style={{ marginTop: 26, fontSize: 30, lineHeight: 1.35, color: "#d8d6ce", maxWidth: 1000 }}>{summary}</span>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {stack.map((s) => (
            <span
              key={s}
              style={{
                display: "flex",
                fontSize: 20,
                letterSpacing: 2,
                color: "#a6a49c",
                border: "1px solid #58564f",
                borderRadius: 999,
                padding: "8px 18px",
              }}
            >
              {s.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
