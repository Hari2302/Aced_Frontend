const Awards = () => {
  return (
    <div className="admin-card admin-card-hover admin-card-animate p-5" style={{ animationDelay: "480ms" }}>
      <h3 className="admin-title font-bold text-lg mb-4">
        Award & Achievement
      </h3>

      <div className="space-y-4 text-sm">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
          <p className="font-semibold text-slate-800">Student Performance</p>
          <p className="text-slate-500">
            
            
          </p>
          <button className="mt-2 text-emerald-700 text-xs font-semibold">
            Card 15
          </button>
        </div>

        <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-3">
          <p className="font-semibold text-slate-800">Employee Service Award</p>
          <p className="text-slate-500">Mary Smith</p>
          <button className="mt-2 text-cyan-700 text-xs font-semibold">
            Card 18
          </button>
        </div>
      </div>
    </div>
  );
};

export default Awards;
