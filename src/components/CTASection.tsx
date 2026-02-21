import Link from "next/link";
import MotionReveal from "./MotionReveal";

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-[color:var(--blue-600)] to-[color:var(--blue-700)] text-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold">Ready for a Better Insurance Experience?</h2>
        <p className="mt-4 max-w-2xl mx-auto text-sky-100">Talk to AskHeirs AI or get started with a tailored plan for your customers.</p>

        <MotionReveal className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/chat" className="inline-flex items-center justify-center rounded-md bg-white text-[color:var(--blue-700)] px-6 py-3 font-medium hover:opacity-95 shadow hover:shadow-lg transition-transform duration-200 transform-gpu hover:-translate-y-0.5">Talk to AskHeirs AI</Link>
          <Link href="/register" className="inline-flex items-center justify-center rounded-md bg-[color:var(--blue-900)] text-white px-6 py-3 font-medium hover:opacity-95 shadow-sm hover:shadow-md transition-transform duration-200 transform-gpu hover:-translate-y-0.5">Get Started</Link>
        </MotionReveal>
      </div>
    </section>
  );
}
