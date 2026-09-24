import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { HowToUse } from "@/components/landing/HowToUse";
import { TryIt } from "@/components/landing/TryIt";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <About />
      <HowToUse />
      <TryIt />
    </main>
  );
}
