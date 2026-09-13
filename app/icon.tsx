import { ImageResponse } from "next/og";

// Next.js App Router picks this up automatically as the site favicon —
// generated on the fly instead of a static .ico, so it matches the
// site's own palette instead of the framework's default icon.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080807",
          borderRadius: 6,
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#e8a33d",
            fontFamily: "sans-serif",
            lineHeight: 1,
          }}
        >
          V
        </span>
      </div>
    ),
    { ...size }
  );
}
