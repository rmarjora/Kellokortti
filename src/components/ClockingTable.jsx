import { useEffect, useState } from 'react';
import { getLateMinutes } from '../utils.js';
import { getAllowedLateMinutes } from '../config.js';

const ClockingTable = ({ user, startDate, endDate }) => {
  const [arrivals, setArrivals] = useState([]);
  const [staff, setStaff] = useState([]);
  const allowedLateMinutes = getAllowedLateMinutes();

  console.log("ClockingTable props:", { user, startDate, endDate });

  useEffect(() => {
    const fetchArrivals = async () => {
      const [data, fullUser, staffList] = await Promise.all([
        window.api.getArrivals(user.id),
        window.api.getUser(user.id),
        window.api.getStaff()
      ]);
      // Set arrivals to only those within the date range if specified
      let filteredArrivals = data;
      if (startDate) {
        const startTime = startDate.getTime();
        const endTime = endDate ? endDate.getTime() + 86399999 : null; // include entire end day
        if (endTime !== null) {
          filteredArrivals = filteredArrivals.filter(a => {
            const arrivalTime = new Date(a.arrivalTime).getTime();
            return arrivalTime >= startTime && arrivalTime <= endTime;
          });
        }
      }
      setArrivals(filteredArrivals);
    };

    fetchArrivals();
  }, [user.id]);

  const formatDate = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('fi-FI');
  };

  const formatTime = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const unauthorizedArrivals = arrivals.filter(arrival => arrival.supervisorId == null);
  const averageLateMinutes = unauthorizedArrivals.length === 0 ? 0 : Math.round(unauthorizedArrivals.reduce((sum, arrival) => sum + getLateMinutes(arrival.arrivalTime), 0) / unauthorizedArrivals.length);

  // Build a map of arrivals by local date string (fi-FI) for quick lookup
  const arrivalByDate = new Map(
    arrivals.map(a => [new Date(a.arrivalTime).toLocaleDateString('fi-FI'), a])
  );

  // Detect if there is an arrival today
  const todayKey = new Date().toLocaleDateString('fi-FI');
  const hasTodayArrival = arrivalByDate.has(todayKey);

  // Produce all weekdays (Mon-Fri) from startDate up to today inclusive
  const days = [];
  if (startDate) {
    const cursor = new Date(startDate);
    cursor.setHours(0,0,0,0);
    // Always clone endDate before mutating
    let effectiveEnd = endDate ? new Date(endDate) : null;
    if (effectiveEnd) effectiveEnd.setHours(0,0,0,0);
    // Exclude today unless already clocked in today
    if (!hasTodayArrival && effectiveEnd) {
      effectiveEnd.setDate(effectiveEnd.getDate() - 1);
    }
    while (effectiveEnd && cursor <= effectiveEnd) {
      const day = cursor.getDay(); // 0 Sun ... 6 Sat
      if (day >= 1 && day <= 5) {
        days.push(new Date(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  // Count absent days among generated weekdays
  const absentDays = days.length === 0
    ? 0
    : days.reduce((cnt, d) => cnt + (arrivalByDate.has(d.toLocaleDateString('fi-FI')) ? 0 : 1), 0);

  return (
    <div>
      <h2>Kellotukset käyttäjälle: {user.name}</h2>
      <h3>Aikaväli {startDate?.toLocaleDateString('fi-FI')} - {endDate?.toLocaleDateString('fi-FI')}</h3>
  <div className="table-container card">
  <table className="data-table">
        <thead>
          <tr>
            <th>Päivä</th>
            <th>Aika</th>
            <th>Lupa</th>
          </tr>
        </thead>
        <tbody>
          {(days.length > 0 ? days : arrivals).map(entry => {
            const d = entry instanceof Date ? entry : new Date(entry.arrivalTime);
            const key = d.toLocaleDateString('fi-FI');
            const arrival = entry instanceof Date ? arrivalByDate.get(key) : entry;
            if (!arrival) {
              return (
                <tr key={key}>
                  <td>{key}</td>
                  <td>-</td>
                  <td className="clocking-absent">Poissa</td>
                </tr>
              );
            }

            const late = getLateMinutes(arrival.arrivalTime) > allowedLateMinutes;
            let label = '';
            let cls = '';

            if (!late) {
              label = 'Ajoissa';
              cls = 'clocking-message';
            } else if (arrival.supervisorId === null) {
              label = 'Ei lupaa';
              cls = 'clocking-error'
            } else if (arrival.supervisorId < 0) {
              label = 'Joku muu';
              cls = 'clocking-message';
            } else {
              const supervisorName = staff.find(s => s.id === arrival.supervisorId)?.name;
              if (supervisorName) {
                label = supervisorName;
                cls = 'clocking-message';
              } else {
                label = 'Tuntematon';
                cls = 'clocking-error';
              }
            }

            return (
              <tr key={arrival.id}>
                <td>{formatDate(arrival.arrivalTime)}</td>
                <td>{formatTime(arrival.arrivalTime)}</td>
                <td className={cls}>{label}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
  </div>
      <div>
        <h3>Yhteenveto</h3>
        <p>Kellotuksia yhteensä: {arrivals.length}</p>
        <p>{averageLateMinutes >= 0 ? `Myöhässä keskimäärin: ${averageLateMinutes} minuuttia` : `Keskimäärin ${-averageLateMinutes} minuuttia liian ajoissa`}</p>
        <p>Luvattomia yli {allowedLateMinutes} min myöhästymisiä: {unauthorizedArrivals.filter(arrival => getLateMinutes(arrival.arrivalTime) > allowedLateMinutes).length}</p>
  <p>Poissaoloja: {absentDays}</p>
      </div>
    </div>
  )
}

export default ClockingTable;