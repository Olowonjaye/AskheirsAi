import Hero from "@/components/Hero";
import PainPoints from "@/components/PainPoints";
import AISection from "@/components/AISection";
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        <Hero />
        <PainPoints />
        <AISection />
        <HowItWorks />
        <CTASection />
      </main>
    </div>
  );
}
