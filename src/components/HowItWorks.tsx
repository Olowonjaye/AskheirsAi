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
          {steps.map((s, idx) => {
            const imageFor = (title: string) => {
              const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9 ]/g, "")
                .replace(/\s+/g, " ")
                .trim()
                .replace(/answers$/, "answer");
              return `/images/${slug}.jpg`;
            };

            return (
              <MotionReveal key={s.title} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow transform-gpu hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <img src={imageFor(s.title)} alt={s.title} className="w-12 h-12 object-contain rounded-md" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{idx + 1}. {s.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
                  </div>
                </div>
              </MotionReveal>
            );
          })}
        </div>
      </div>
    </section>
    );
   }

