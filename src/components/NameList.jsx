import { useEffect, useState, useCallback, useRef } from 'react';
import ClickableName from "./ClickableName";
import Popup from "./Popup";
import PersonLogin from "./PersonLogin";
import Clocking from "./Clocking";
import Options from './Options';

const NameList = ({ people, supervised }) => {
  if (people.length === 0) {
    return <div>Henkilöitä ei ole</div>;
  }

  const [arrivals, setArrivals] = useState([]);

  const refetchArrivals = useCallback(async () => {
    const todays = await window.api.getTodaysArrivals();
    console.log("Today's arrivals:", todays);
    setArrivals(todays);
  }, []);

  useEffect(() => {
    refetchArrivals();
  }, []);

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [showClocking, setShowClocking] = useState(false);

    const handleNameClick = (person) => {
      console.log('Clicked person:', person);
      setSelectedPerson(person);
      supervised ? setShowClocking(true) : setShowPasswordPopup(true);
    };

    const handleCancel = () => {
      setShowPasswordPopup(false);
      setShowClocking(false);
      setSelectedPerson(null);
    };

    const handleLoginSuccess = (person) => {
      // Switch to Clocking view within the same Popup
      setShowClocking(true);
    };

  // Mathematical layout: compute optimal tile size (2:1 aspect) to fit all names into ~60vh
  const wrapperRef = useRef(null);
  const [tileW, setTileW] = useState(240);
  const [gap, setGap] = useState(14);

  useEffect(() => {
    let rafId;
    const recompute = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
  const styles = window.getComputedStyle(wrapper);
  const padX = parseFloat(styles.paddingLeft || '0') + parseFloat(styles.paddingRight || '0');
  const padY = parseFloat(styles.paddingTop || '0') + parseFloat(styles.paddingBottom || '0');
  const widthAvail = Math.max(0, wrapper.clientWidth - padX);
  // Use 60% of viewport height as the vertical budget to maximize tile size
  const heightAvail = Math.max(0, Math.floor(window.innerHeight * 0.6) - padY);
      const n = people.length;
      if (widthAvail <= 0 || heightAvail <= 0 || n === 0) return;

      // Gap function must match CSS: gap ≈ clamp(6, tileW * 0.08, 28)
      const clamp = (min, val, max) => Math.max(min, Math.min(max, val));
      const gapFor = (w) => clamp(6, w * 0.08, 28);

      // Padding functions must match CSS padding clamps
      const Ph = (w) => clamp(10, w * 0.07, 20); // horizontal padding per side
      const Pv = (w) => clamp(8, w * 0.06, 16);  // vertical padding per side
      const B = 1; // border (each side)

  let bestW = 0;
      // Try different column counts to maximize tile width
  const maxCols = Math.min(n, 50); // reasonable cap
  for (let cols = 1; cols <= maxCols; cols++) {
        const rows = Math.ceil(n / cols);
        // Helper to compute border-box tile height for width w
        const tileHeight = (w) => {
          const contentW = Math.max(0, w - 2 * Ph(w) - 2 * B);
          const contentH = contentW / 2; // 2:1 aspect
          return contentH + 2 * Pv(w) + 2 * B;
        };

        // Binary search max width satisfying both horizontal and vertical constraints
        // Upper bound: limited by horizontal constraint ignoring gap then reduced
  let hi = Math.max(80, widthAvail / cols);
  let lo = 80; // enforce a sensible minimum tile width
        let bestForCols = 0;
        for (let i = 0; i < 18; i++) {
          const w = (lo + hi) / 2;
          const g = gapFor(w);
          const totalW = cols * w + (cols - 1) * g;
          const totalH = rows * tileHeight(w) + (rows - 1) * g;
          const fitsW = totalW <= (widthAvail - 1); // tiny epsilon
          const fitsH = totalH <= (heightAvail - 1);
          if (fitsW && fitsH) {
            bestForCols = w;
            lo = w; // try bigger
          } else {
            hi = w; // too big
          }
        }
        const wCandidate = bestForCols;
        if (wCandidate > bestW) bestW = wCandidate;
      }
      if (bestW > 0) {
        // Add a tiny safety margin to avoid rounding overflow
  const safeW = Math.floor(bestW) - 2;
  const finalW = Math.max(100, safeW);
        setTileW(finalW);
        // Use the exact same gap as solver
        setGap(Math.round(gapFor(finalW)));
      }
    };

    const schedule = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(recompute);
    };

    schedule();
    window.addEventListener('resize', schedule);
    const ro = new ResizeObserver(schedule);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => {
      window.removeEventListener('resize', schedule);
      ro.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [people.length]);

  return (
      <>
        <div
          className="name-list-wrapper"
          ref={wrapperRef}
          style={{ '--tileW': `${tileW}px`, '--gap': `${gap}px` }}
        >
          <div className="name-list">
            {people.map((person) => (
              <ClickableName
                key={person.id}
                name={person.name}
                onClick={() => handleNameClick(person)}
                hasArrived={arrivals.some(arrival => arrival.userId === person.id)}
              />
            ))}
          </div>
        </div>
        <Popup open={showPasswordPopup} onClose={handleCancel} exitText='Takaisin'>
          <PersonLogin person={selectedPerson} onSuccess={handleLoginSuccess} />
        </Popup>
        <Popup open={showClocking} onClose={handleCancel} exitText= {supervised ? 'Takaisin' : 'Kirjaudu ulos'}>
          <h3>{selectedPerson?.name}</h3>
          <Clocking
            person={selectedPerson}
            onClocked={refetchArrivals}
            supervised={supervised}
          />
          <Options user={selectedPerson} supervised={supervised} onDeleted={handleCancel} />
        </Popup>
      </>
    );
};

export default NameList;