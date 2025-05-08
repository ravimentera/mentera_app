import { format } from "date-fns";

export function TimeGrid() {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const date = new Date();
    date.setHours(i, 0, 0);
    return format(date, "h a");
  });

  return (
    <div className="w-20 border-r">
      <div className="grid grid-rows-[repeat(24,_minmax(60px,_1fr))]">
        {hours.map((hour) => (
          <div key={hour} className="border-b border-gray-100 px-2 -mt-3 text-sm text-gray-500">
            {hour}
          </div>
        ))}
      </div>
    </div>
  );
}
