import { getWorkStartTime } from "./config";

export const getLateMinutes = (arrivalTime) => {
    if (!arrivalTime) return 0;
    const workStartTime = getWorkStartTime();
    const arrivalDate = new Date(arrivalTime);
    const start = new Date(arrivalDate);
    start.setHours(workStartTime.hour, workStartTime.minute, 0, 0);
    const diffMin = Math.round((arrivalDate.getTime() - start.getTime()) / 60000);
    return diffMin;
  };