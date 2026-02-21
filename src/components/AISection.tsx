export default function AISection() {
  const bullets = [
    "What does my policy cover?",
    "When is my renewal?",
    "What should I do if something happens?",
  ];

  return (
    <section
      id="ai"
      className="py-20 bg-[color:var(--blue-50)]"
      style={{
        backgroundImage:
          "url('https://www.heirsinsurancegroup.com/wp-content/uploads/2024/01/Heirs-Insurance.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[color:var(--blue-900)]">Meet AskHeirs AI</h2>
            <p className="mt-4 text-slate-700 max-w-xl">A conversational assistant that helps customers understand policies, check renewals, and guides them during claims.</p>

            <ul className="mt-6 space-y-3 text-slate-700 pl-5">
              {bullets.map((b) => (
                <li key={b} className="relative pl-5 before:absolute before:left-0 before:top-1 before:h-2 before:w-2 before:rounded-full before:bg-[color:var(--blue-600)]">{b}</li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-64 sm:w-72 md:w-80 bg-white rounded-2xl shadow-xl p-4 flex items-center justify-center ring-1 ring-slate-100 transform-gpu transition-transform duration-300 hover:-translate-y-1">Phone Mockup</div>
          </div>
        </div>
      </div>
    </section>
  );
}
