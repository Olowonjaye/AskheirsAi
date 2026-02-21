import MotionReveal from "./MotionReveal";

export default function HowItWorks() {
  const steps = [
    { title: "Ask Anytime", desc: "Chat or voice — get instant answers." },
    { title: "Get Answers", desc: "Clear explanations of coverage and next steps." },
    { title: "Stay Guided", desc: "Reminders and proactive alerts." },
    { title: "Human Help", desc: "Seamless escalation to support agents." },
  ];

  return (
    <section id="how" className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[color:var(--blue-900)] text-center">How It Works</h2>
        <p className="mt-4 text-center text-slate-600 max-w-2xl mx-auto">A simple flow to get fast, reliable insurance guidance from AskHeirs AI.</p>

        <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-4">
          <MotionReveal className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow transform-gpu hover:-translate-y-1">
            <h3 className="text-lg font-semibold text-slate-800">1. Start a Conversation</h3>
            <p className="mt-2 text-sm text-slate-600">Tell AskHeirs about your policy question or situation.</p>
          </MotionReveal>

          <MotionReveal className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow transform-gpu hover:-translate-y-1">
            <h3 className="text-lg font-semibold text-slate-800">2. AI Summarizes & Guides</h3>
            <p className="mt-2 text-sm text-slate-600">AI gives clear steps, next actions, and document lists.</p>
          </MotionReveal>

          <MotionReveal className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow transform-gpu hover:-translate-y-1">
            <h3 className="text-lg font-semibold text-slate-800">3. Track & Save</h3>
            <p className="mt-2 text-sm text-slate-600">Save conversations to your account for later reference.</p>
          </MotionReveal>

          <MotionReveal className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow transform-gpu hover:-translate-y-1">
            <h3 className="text-lg font-semibold text-slate-800">4. Human Escalation</h3>
            <p className="mt-2 text-sm text-slate-600">If needed, escalate to an agent with conversation context.</p>
          </MotionReveal>
        </div>
      </div>
    </section>
    );
   }

