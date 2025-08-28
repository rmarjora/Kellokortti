// Synchronous getters for settings with sane defaults
export const getWorkStartTime = () => {
  const hour = window.apiSync?.getSetting('work_start_time_hour');
  const minute = window.apiSync?.getSetting('work_start_time_minute');
  return { hour: Number(hour ?? 9), minute: Number(minute ?? 0) };
}

export const getAllowedLateMinutes = () => {
  const a = window.apiSync?.getSetting('allowed_late_minutes');
  return Number(a ?? 15);
}