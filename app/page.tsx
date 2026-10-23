import Hero from "@/components/Hero";
import SelectedWorks from "@/components/SelectedWorks";
import PhotographyGallery from "@/components/PhotographyGallery";
import Experience from "@/components/Experience";
import PlaygroundTeaser from "@/components/PlaygroundTeaser";
import About from "@/components/About";
import Contact from "@/components/Contact";
import SignatureLine from "@/components/SignatureLine";
import SkillsTicker from "@/components/SkillsTicker";
import { personJsonLd } from "@/lib/site";

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <SelectedWorks />
      <SignatureLine className="page-pad py-4" />
      <PhotographyGallery />
      <Experience />
      <PlaygroundTeaser />
      <SkillsTicker />
      <About />
      <Contact />
    </>
  );
}
