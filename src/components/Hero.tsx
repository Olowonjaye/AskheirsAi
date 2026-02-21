import Image from "next/image";
import Link from "next/link";
import MotionReveal from "./MotionReveal";
import ParallaxImage from "./ParallaxImage";

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
                <Link href="/register" className="inline-flex items-center text-[color:var(--blue-700)] font-medium hover:text-[color:var(--blue-800)] transition-colors">Get Started</Link>
              </div>

              <div className="mt-10">
                <div className="w-full max-w-md rounded-xl bg-white/40 backdrop-blur-sm border border-white/20 p-4 transform-gpu transition-transform duration-200 hover:-translate-y-1">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/30 flex items-center justify-center text-white font-semibold" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(79,70,229,0.08))' }}>
                      <img
                        src="https://media.licdn.com/dms/image/v2/C4E0BAQF0faqsoz5SqA/company-logo_200_200/company-logo_200_200/0/1630620275967/heirs_life_logo?e=2147483647&v=beta&t=q2qJrNlN2K5ZHWLQ_aNO7fr26hIosaNm9C4XfqnwNpE"
                        alt="AskHeirs AI"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    </div>
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
              {/* ParallaxImage is a client component that moves subtly with mouse */}
              <ParallaxImage src="/images/askheirs phone mockup.png" alt="Phone mockup" className="float-anim" />
            </div>

            {/* floating mini chat card */}
            <div className="absolute right-8 bottom-12 w-64 sm:w-80">
              <div className="rounded-lg bg-white shadow-lg p-4 border border-gray-100 transform-gpu transition-shadow duration-300 hover:shadow-2xl">
                <div className="text-xs text-slate-500">Recent</div>
                <div className="mt-2 text-sm text-slate-800 chat-entrance">How do I renew my policy?</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
