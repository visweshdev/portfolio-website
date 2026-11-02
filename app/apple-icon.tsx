import { ImageResponse } from "next/og";

// Home-screen icon (iOS etc.) — same mark as app/icon.svg, drawn larger.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#080807" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <path d="M3.5 6.5h6L16 22v4.5h-3.2z" fill="#e8a33d" />
          <path d="M16 22l6.5-15.5h6l-9.3 20H16z" fill="#f6c46f" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
