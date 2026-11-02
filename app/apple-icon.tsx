import { ImageResponse } from "next/og";

// Home-screen icon (iOS etc.) — same mark as app/icon.svg, drawn larger.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#000" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <path d="M5.5 6.5h4.6L16.4 22l-1.6 4z" fill="#fff" />
          <path d="M14.8 26C18 16.5 22 9.5 28.5 4.5 23.5 10.5 19.5 18 16.4 26z" fill="#fff" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
