import { useState, useEffect } from "react";

const CurrentTime = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: "center", fontSize: "4rem", color: "var(--text)" }}>
      {time.toLocaleDateString('fi-FI')} {time.toLocaleTimeString('fi-FI')}
    </div>
  );
};

export default CurrentTime;