import { useEffect, useState, useCallback, useRef } from 'react';
import ClickableName from "./ClickableName";
import Popup from "./Popup";
import PersonLogin from "./PersonLogin";
import Clocking from "./Clocking";
import Options from './Options';
import applePaySfx from '../assets/apple_pay.mp3';

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

  // Auto-refetch at local midnight and when the window regains focus
  useEffect(() => {
    let timerId;

    const scheduleNextMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      // Set to next local midnight
      nextMidnight.setHours(24, 0, 0, 0);
      const delay = Math.max(0, nextMidnight.getTime() - now.getTime() + 100); // small buffer
      timerId = setTimeout(() => {
        refetchArrivals();
        scheduleNextMidnight(); // schedule again for the following day
      }, delay);
    };

    scheduleNextMidnight();
    window.addEventListener('focus', refetchArrivals);

    return () => {
      if (timerId) clearTimeout(timerId);
      window.removeEventListener('focus', refetchArrivals);
    };
  }, [refetchArrivals]);

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [showClocking, setShowClocking] = useState(false);
  const [viaKeycard, setViaKeycard] = useState(false);
  const autoCloseTimerRef = useRef(null);

  // Preload Apple Pay sound and provide a small helper to play it
  const sfxRef = useRef(null);
  useEffect(() => {
    const a = new Audio(applePaySfx);
    a.preload = 'auto';
    sfxRef.current = a;
    return () => {
      try { a.pause(); } catch { /* noop */ }
      sfxRef.current = null;
    };
  }, []);
  const playChime = useCallback(() => {
    const a = sfxRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {});
  }, []);

  // Allow external trigger (e.g., keycard scan) to open user panel on homepage
  useEffect(() => {
    // Only listen for keycards in unsupervised mode
    if (supervised) return;

  const unsubscribe = window.api.onKeycardScanned(async (payload) => {
      // Ignore scans while another component is capturing a keycard (e.g., add keycard flow)
      if (typeof window !== 'undefined' && window.__keycardCaptureActive) return;
      const uid = typeof payload === 'string' ? payload : payload?.uid;
      if (!uid) return;
      try {
        const person = await window.api.getUserByCardUid(uid);
        if (person) {
      // Successful recognition -> play chime
      playChime();
          setSelectedPerson(person);
          setViaKeycard(true);
          setShowClocking(true); // bypass password when coming from keycard in unsupervised mode
        }
      } catch (e) {
        console.error('getUserByCardUid failed', e);
      }
    });

    return () => {
      try { if (typeof unsubscribe === 'function') unsubscribe(); } catch (_) {}
    };
  }, [supervised]);

    // Reset viaKeycard only when the Clocking popup fully closes
    useEffect(() => {
      if (!showClocking) setViaKeycard(false);
    }, [showClocking]);

    const handleNameClick = (person) => {
      console.log('Clicked person:', person);
      setSelectedPerson(person);
      supervised ? setShowClocking(true) : setShowPasswordPopup(true);
    };

    const handleCancel = () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
      setShowPasswordPopup(false);
      setShowClocking(false);
      setSelectedPerson(null);
    };

    const handleLoginSuccess = (person) => {
      // Switch to Clocking view within the same Popup
      setShowClocking(true);
    };

  // Mathematical layout: compute optimal tile size (2:1 aspect) to fit all names into ~50vh
  const wrapperRef = useRef(null);
  const blockRef = useRef(null);
  const [tileW, setTileW] = useState(240);
  const [gap, setGap] = useState(14);
  const statsRef = useRef(null);
  const [statsPos, setStatsPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    let rafId;
    const recompute = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
  const styles = window.getComputedStyle(wrapper);
  const padX = parseFloat(styles.paddingLeft || '0') + parseFloat(styles.paddingRight || '0');
  const padY = parseFloat(styles.paddingTop || '0') + parseFloat(styles.paddingBottom || '0');
  const widthAvail = Math.max(0, wrapper.clientWidth - padX);
  // Use 50% of viewport height as the vertical budget to keep the list more compact
  const heightAvail = Math.max(0, Math.floor(window.innerHeight * 0.5) - padY);
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

  // Count unique arrivals for today
  const arrivedCount = new Set(arrivals.map(a => a.userId)).size;

  // Position the stats slightly below the list and aligned to the rightmost tile
  useEffect(() => {
    const update = () => {
      const wrapper = wrapperRef.current;
      const block = blockRef.current;
      if (!wrapper || !block) return;
      const tiles = wrapper.querySelectorAll('.clickable-name');
      if (!tiles || tiles.length === 0) return;
      const wrapperRect = wrapper.getBoundingClientRect();
      const blockRect = block.getBoundingClientRect();
      let maxRight = -Infinity;
      let maxBottom = -Infinity;
      tiles.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.right > maxRight) maxRight = r.right;
        if (r.bottom > maxBottom) maxBottom = r.bottom;
      });
      // Position relative to the block container so the stat can extend beyond the wrapper
      const right = Math.max(0, Math.round(blockRect.right - maxRight));
      const top = Math.max(0, Math.round(maxBottom - blockRect.top + 6)); // 6px below tiles
  setStatsPos({ top, right });
    };
    update();
    window.addEventListener('resize', update);
    const ro = new ResizeObserver(update);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => {
      window.removeEventListener('resize', update);
      ro.disconnect();
    };
  }, [people.length, tileW, gap]);

  // Auto-close after auto keycard clock-in; cancel on interactions
  const handleAutoClocked = useCallback(() => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    autoCloseTimerRef.current = setTimeout(() => {
      // Close the popup if still open
      if (showClocking) handleCancel();
    }, 5000);
  }, [showClocking]);

  // Cancel auto-close if user clicks any button inside the Clocking popup
  const clockingContainerRef = useRef(null);
  useEffect(() => {
    const el = clockingContainerRef.current;
    if (!el) return;
    const onAnyButton = (e) => {
      const target = e.target;
      if (target && target.closest('button')) {
        if (autoCloseTimerRef.current) {
          clearTimeout(autoCloseTimerRef.current);
          autoCloseTimerRef.current = null;
        }
      }
    };
    el.addEventListener('click', onAnyButton);
    return () => el.removeEventListener('click', onAnyButton);
  }, [showClocking]);

  return (
      <>
        <div className="name-list-block" ref={blockRef}>
          <div
            className="name-list-wrapper"
            ref={wrapperRef}
            style={{ '--tileW': `${tileW}px`, '--gap': `${gap}px` }}
          >
            <div className="name-list">
              {people.toSorted((a, b) => a.name.localeCompare(b.name)).map((person) => (
                <ClickableName
                  key={person.id}
                  name={person.name}
                  onClick={() => handleNameClick(person)}
                  hasArrived={arrivals.some(arrival => arrival.userId === person.id)}
                />
              ))}
            </div>
          </div>
          {/* Right-aligned arrivals/total stat positioned relative to the block (can overflow wrapper) */}
          <div
            className="name-list-stats"
            ref={statsRef}
            style={{ top: `${statsPos.top}px`, right: `${statsPos.right}px` }}
          >
            <span>Paikalla: {arrivedCount}/{people.length}</span>
          </div>
        </div>
        <Popup open={showPasswordPopup} onClose={handleCancel} exitText='Takaisin'>
          <PersonLogin person={selectedPerson} onSuccess={handleLoginSuccess} />
        </Popup>
        <Popup open={showClocking} onClose={handleCancel} exitText= {supervised ? 'Takaisin' : 'Kirjaudu ulos'}>
          <h3>{selectedPerson?.name}</h3>
          <div ref={clockingContainerRef}>
            <Clocking
              person={selectedPerson}
              onClocked={refetchArrivals}
              supervised={supervised}
              viaKeycard={viaKeycard}
              onAutoClocked={handleAutoClocked}
              suppressChime={viaKeycard}
            />
            <Options user={selectedPerson} supervised={supervised} onDeleted={handleCancel} />
          </div>
        </Popup>
      </>
    );
};

export default NameList;