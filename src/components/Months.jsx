import { useState, useEffect } from "react"
import Popup from "./Popup";
import ClockingTable from "./ClockingTable";

const Months = ({ user }) => {
  const [months, setMonths] = useState([]);
  const [currentStartDate, setCurrentStartDate] = useState(null);
  const [currentEndDate, setCurrentEndDate] = useState(null);
  const [showTable, setShowTable] = useState(false);

    useEffect(() => {
      const fetchArrivals = async () => {
        const [data, fullUser] = await Promise.all([
          window.api.getArrivals(user.id),
          window.api.getUser(user.id)
        ]);
        // Prefer user's creation time; fallback to earliest arrival
        const created = fullUser?.time_created ? new Date(fullUser.time_created) : null;
        const earliestArrival = data.length > 0
          ? new Date(Math.min(...data.map(a => new Date(a.arrivalTime).getTime())))
          : null;
        const start = (created && !Number.isNaN(created.getTime())) ? created : (earliestArrival ?? null);

        // Generate half-months list
        if (start) {
          const finnishMonths = [
            "tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu",
            "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"
          ];
          const halfMonthsList = [];
          const now = new Date();
          let current = new Date(start.getFullYear(), start.getMonth(), 1);
          // Set end to today at 23:59:59.999 to always include the current day
          const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          while (current <= end) {
            // First half: 1st-15th
            const firstHalfStart = new Date(current.getFullYear(), current.getMonth(), 1);
            let firstHalfEnd = new Date(current.getFullYear(), current.getMonth(), 15);
            if (firstHalfEnd > end) firstHalfEnd = new Date(end);
            if (firstHalfEnd >= start && firstHalfStart <= end) {
              const monthName = finnishMonths[firstHalfStart.getMonth()];
              const year = firstHalfStart.getFullYear();
              halfMonthsList.push({
                label: `01-15 ${monthName} ${year}`,
                start: new Date(firstHalfStart),
                end: new Date(firstHalfEnd)
              });
            }
            // Second half: 16th-end
            const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
            const secondHalfStart = new Date(current.getFullYear(), current.getMonth(), 16);
            let secondHalfEnd = new Date(current.getFullYear(), current.getMonth(), lastDay, 23, 59, 59, 999);
            if (secondHalfEnd > end) secondHalfEnd = new Date(end);
            if (secondHalfEnd >= start && secondHalfStart <= end) {
              const monthName = finnishMonths[secondHalfStart.getMonth()];
              const year = secondHalfStart.getFullYear();
              halfMonthsList.push({
                label: `16-${lastDay} ${monthName} ${year}`,
                start: new Date(secondHalfStart),
                end: new Date(secondHalfEnd)
              });
            }
            // Next month
            current.setMonth(current.getMonth() + 1);
          }

          // A final item for the whole interval
          halfMonthsList.push({
            label: `Kaikki ajat`,
            start: new Date(start),
            end: new Date(end)
          });
          setMonths(halfMonthsList);
        } else {
          setMonths([]);
        }
      };
      fetchArrivals();
    }, [user.id]);

  console.log("Generated months:", months);

  const handleMonthClick = (month) => {
    setCurrentStartDate(month.start);
    setCurrentEndDate(month.end);
    setShowTable(true);
  };

  return (
    <div>
      <h2>Valitse aikaväli:</h2>
      <ul>
        {months.map((m, index) => (
          <li key={index}>
            <button onClick={() => handleMonthClick(m)}>
              {m.label}
            </button>
          </li>
        ))}
      </ul>
    <Popup open={showTable} onClose={() => {setShowTable(false)}} exitText='Sulje'>
      <ClockingTable user={user} startDate={currentStartDate} endDate={currentEndDate} />
    </Popup>
    </div>
  )
}

export default Months;