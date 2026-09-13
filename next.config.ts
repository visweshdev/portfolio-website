import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Don't advertise the framework in response headers.
  poweredByHeader: false,
  images: {
    // Next 16 only serves qualities explicitly allowed here — without
    // this, a `quality={95}` prop is silently clamped back to the
    // default 75, which matters a lot for already-compressed photos.
    qualities: [75, 90, 95],
  },
};

export default nextConfig;
