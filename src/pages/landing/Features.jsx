const features = [
  {
    title: "Qualified Mentors",
    description:
      "Subject experts with guided NEET revision plans and performance tracking.",
  },
  {
    title: "Smart Classrooms",
    description:
      "Interactive sessions with practice tests, analytics, and rapid feedback.",
  },
  {
    title: "Best Curriculum",
    description:
      "A structured path aligned to NEET, board, and entrance exam standards.",
  },
];

const Features = () => {
  return (
    <section id="features" className="site-section py-20 bg-gradient-to-b from-[#f4fbf7] to-[#ebf7f1]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-10 animate-fade-up">
          <p className="text-emerald-600 font-semibold uppercase tracking-[0.14em] text-xs mb-2">
            Features
          </p>
          <h2 className="site-title text-3xl md:text-5xl font-bold mb-3">
            Everything Needed To Learn Faster
          </h2>
          <p className="site-subtitle">
            Designed for consistency, confidence, and top performance.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((item, index) => (
            <article key={item.title} className="site-card p-6 admin-card-hover animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold mb-4">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="site-title text-xl font-bold mb-2">
                {item.title}
              </h3>
              <p className="text-slate-600 text-sm">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
