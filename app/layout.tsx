import type { Metadata } from "next";
import { spaceGrotesk, inter, plexMono, caveat } from "@/lib/fonts";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Viswesh Kesarla",
  description:
    "Personal portfolio of Viswesh Kesarla — Computer Science student building with AI, LLMs and RAG, and shooting photography in the space between.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <SmoothScroll>
          <CustomCursor />
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
