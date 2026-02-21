import Image from "next/image";
import Link from "next/link";
import MotionReveal from "./MotionReveal";

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-b from-sky-50 to-white">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <MotionReveal>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-sky-900 leading-tight">AskHeirs AI</h1>
              <p className="mt-4 text-lg sm:text-xl text-slate-700 max-w-2xl">Your smart, friendly insurance assistant — instant clarity on policies, renewals, and claims.</p>

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
                <Link href="/chat" className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-[color:var(--blue-600)] to-[color:var(--blue-700)] px-6 py-3 text-base font-semibold text-white shadow-lg hover:scale-[1.02] transform-gpu transition duration-200">Talk to AskHeirs AI</Link>
                <Link href="/get-started" className="inline-flex items-center text-[color:var(--blue-700)] font-medium hover:text-[color:var(--blue-800)] transition-colors">Get Started</Link>
              </div>

              <div className="mt-10">
                <div className="w-full max-w-md rounded-xl bg-white/40 backdrop-blur-sm border border-white/20 p-4 transform-gpu transition-transform duration-200 hover:-translate-y-1">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/30 flex items-center justify-center text-white font-semibold" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(79,70,229,0.08))' }}>A</div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">AskHeirs Assistant</p>
                      <p className="text-xs text-slate-600">"What does my policy cover?"</p>
                    </div>
                  </div>
                </div>
              </div>
            </MotionReveal>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="w-full h-96 sm:h-[520px] relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-100">
              <Image src="/placeholder-phone.png" alt="Phone mockup" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>

            {/* floating mini chat card */}
            <div className="absolute right-8 bottom-12 w-64 sm:w-80">
              <div className="rounded-lg bg-white shadow-lg p-4 border border-gray-100 transform-gpu transition-shadow duration-300 hover:shadow-2xl">
                <div className="text-xs text-slate-500">Recent</div>
                <div className="mt-2 text-sm text-slate-800">"How do I renew my policy?"</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
