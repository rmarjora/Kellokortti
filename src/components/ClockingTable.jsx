import { useEffect, useState } from 'react';
import { getLateMinutes } from '../utils.js';
import { getAllowedLateMinutes } from '../config.js';

const ClockingTable = ({ user }) => {
  const [arrivals, setArrivals] = useState([]);
  const allowedLateMinutes = getAllowedLateMinutes();

  useEffect(() => {
    const fetchArrivals = async () => {
      const data = await window.api.getArrivals(user.id);
      setArrivals(data);
      console.log("Fetched arrivals for user", user.id, data);
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

  return (
    <div>
      <h2>Kellotukset käyttäjälle: {user.name}</h2>
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
          {arrivals.map((arrival) => {
            const late = getLateMinutes(arrival.arrivalTime) > allowedLateMinutes;
            let label = '';
            let cls = '';

            if (!late) {
              label = 'Ajoissa';
              cls = 'clocking-message';
            } else if (arrival.supervisorId != null) {
              label = arrival.supervisorId < 0 ? 'Joku muu' : 'Lupa lisätty';
              cls = 'clocking-message';
            } else {
              label = 'Ei lupaa';
              cls = 'clocking-error';
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
        <p>{averageLateMinutes > 0 ? `Myöhässä keskimäärin: ${averageLateMinutes} minuuttia` : `Ajoissa keskimäärin: ${-averageLateMinutes} minuuttia`}</p>
        <p>Luvattomia yli {allowedLateMinutes} min myöhästymisiä: {unauthorizedArrivals.filter(arrival => getLateMinutes(arrival.arrivalTime) > allowedLateMinutes).length}</p>
      </div>
    </div>
  )
}

export default ClockingTable;