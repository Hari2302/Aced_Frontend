import { useMemo, useState } from "react";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getMonthLabel = (date) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    date,
  );

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = new Date();

  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonthDays = new Date(year, month, 0).getDate();
    const cells = [];

    for (let i = firstDayIndex - 1; i >= 0; i -= 1) {
      const day = prevMonthDays - i;
      cells.push({
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    const remaining = 42 - cells.length;
    for (let day = 1; day <= remaining; day += 1) {
      cells.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [currentMonth]);

  return (
    <div className="admin-card admin-card-hover admin-card-animate p-5" style={{ animationDelay: "430ms" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="admin-title font-bold text-lg">School Calendar</h3>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="px-2 py-1 text-sm border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors" aria-label="Previous month">
            {"<"}
          </button>
          <p className="text-sm font-semibold min-w-[130px] text-center text-slate-700">
            {getMonthLabel(currentMonth)}
          </p>
          <button type="button" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="px-2 py-1 text-sm border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors" aria-label="Next month">
            {">"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs text-center">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="font-semibold text-gray-600 py-1">
            {day}
          </div>
        ))}

        {calendarCells.map((cell) => {
          const isToday = isSameDay(cell.date, today);

          return (
            <div key={cell.date.toISOString()} className={`rounded border p-2 ${cell.isCurrentMonth ? "text-gray-800 bg-white" : "text-gray-400 bg-gray-50"} ${isToday ? "border-green-500 bg-green-50 font-semibold" : "border-gray-100"} transition-colors`}>
              {cell.date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
