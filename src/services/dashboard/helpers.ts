export function startOfUtcWeekSunday(d: Date): Date {
  const day = d.getUTCDay();
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() - day);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}
