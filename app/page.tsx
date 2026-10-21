import Hero from "@/components/Hero";
import SelectedWorks from "@/components/SelectedWorks";
import PhotographyGallery from "@/components/PhotographyGallery";
import Experience from "@/components/Experience";
import PlaygroundTeaser from "@/components/PlaygroundTeaser";
import About from "@/components/About";
import Contact from "@/components/Contact";
import SignatureLine from "@/components/SignatureLine";

export default function Home() {
  return (
    <>
      <Hero />
      <SelectedWorks />
      <SignatureLine className="page-pad py-4 bg-bg" />
      <PhotographyGallery />
      <Experience />
      <PlaygroundTeaser />
      <About />
      <Contact />
    </>
  );
}
