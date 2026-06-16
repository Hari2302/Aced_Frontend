const EmployeesStatus = ({ active = 0, total = 0 }) => {
  const percentage = total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <div className="admin-card admin-card-hover admin-card-animate p-5" style={{ animationDelay: "380ms" }}>
      <h3 className="admin-title font-bold mb-4 text-lg">Employees Status</h3>

      <div className="flex justify-center">
        <div className="w-36 h-36 rounded-full border-[10px] border-emerald-300 bg-emerald-50 flex items-center justify-center text-3xl font-extrabold text-emerald-900 shadow-inner">
          {percentage}%
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-600 space-y-1">
        <p>Active: {active}</p>
        <p>Inactive: {Math.max(total - active, 0)}</p>
      </div>
    </div>
  );
};

export default EmployeesStatus;
