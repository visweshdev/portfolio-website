import type { Metadata } from "next";
import { spaceGrotesk, inter, plexMono, caveat } from "@/lib/fonts";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import InlineScript from "@/components/InlineScript";
import LightsOut from "@/components/LightsOut";
import HoverDistortFilter from "@/components/HoverDistortFilter";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s — ${SITE_NAME}`,
    default: SITE_NAME,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
  },
};

// Runs before first paint:
//  - marks <html> as JS-enabled so animated-in content can start hidden
//    (see "Pre-hydration hidden states" in globals.css);
//  - adds `intro` on every full page load (unless reduced motion) so the
//    lights-out loading screen covers the page from the very first frame;
//  - makes every full load / reload start at the top (the hero): turns off
//    the browser's scroll restoration and drops any #section left in the
//    address by the nav, which would otherwise jump down the page.
// If the animation code never loads, both classes are removed again so
// nothing stays hidden or covered.
const JS_FLAG = `(function(d){d.classList.add("js");try{history.scrollRestoration="manual";if(location.hash)history.replaceState(history.state,"",location.pathname+location.search);scrollTo(0,0)}catch(e){}try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("intro")}catch(e){}setTimeout(function(){if(!window.__motionReady)d.classList.remove("js","intro")},8000)})(document.documentElement)`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} ${caveat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={JS_FLAG} />
      </head>
      <body className="min-h-full flex flex-col text-fg">
        <LightsOut />
        <HoverDistortFilter />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[500] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-bg label-mono"
        >
          Skip to content
        </a>
        <SmoothScroll>
          <CustomCursor />
          <Navigation />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
