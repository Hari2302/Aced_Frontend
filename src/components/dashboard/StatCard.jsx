const toneClasses = {
  emerald: "from-emerald-100 to-green-50 text-emerald-900 border-emerald-200",
  cyan: "from-cyan-100 to-sky-50 text-cyan-900 border-cyan-200",
  amber: "from-amber-100 to-orange-50 text-amber-900 border-amber-200",
  violet: "from-violet-100 to-indigo-50 text-violet-900 border-violet-200",
  slate: "from-slate-100 to-gray-50 text-slate-900 border-slate-200",
};

const StatCard = ({ title, value, tone = "emerald", delay = 0 }) => {
  const toneClass = toneClasses[tone] || toneClasses.emerald;

  return (
    <div className={`admin-card admin-card-hover admin-card-animate p-4 md:p-5 bg-gradient-to-br ${toneClass}`} style={{ animationDelay: `${delay}ms` }}>
      <p className="text-xs uppercase tracking-[0.14em] opacity-75">{title}</p>
      <h2 className="text-2xl md:text-3xl font-extrabold mt-2">{value}</h2>
    </div>
  );
};

export default StatCard;
