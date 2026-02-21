import MotionReveal from "./MotionReveal";

export default function PainPoints() {
  const features = [
    { title: "Confusing Jargon", desc: "Policies are full of legalese and unclear terms." },
    { title: "Long Wait Times", desc: "Slow support and delayed claim handling." },
    { title: "Hard to Access", desc: "Multiple channels and complex procedures." },
    { title: "Impersonal Service", desc: "Lack of empathy and personalization." },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-[color:var(--blue-800)]">Why Insurance Feels Hard Today</h2>
        <p className="mt-4 text-center text-slate-600 max-w-2xl mx-auto">Customers face barriers that make insurance confusing, slow and impersonal. We fix that.</p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => {
            const letter = f.title.charAt(0).toUpperCase();
            const letterMap: Record<string, string> = {
              C: "c.jpg",
              L: "l.jpg",
              H: "h.jpg",
              I: "i.png",
            };
            const imgFile = letterMap[letter] ?? null;

            return (
              <MotionReveal key={f.title} className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-shadow transform-gpu hover:-translate-y-1 p-6">
                <div className="h-12 w-12 rounded-lg bg-[color:var(--blue-50)] flex items-center justify-center">
                  {imgFile ? (
                    <img src={`/images/${imgFile}`} alt={`${letter} icon`} className="h-8 w-8 object-contain" />
                  ) : (
                    <span className="text-[color:var(--blue-700)] font-semibold text-lg">{letter}</span>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-800">{f.title}</h3>
                <p className="mt-2 text-slate-600 text-sm">{f.desc}</p>
              </MotionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
