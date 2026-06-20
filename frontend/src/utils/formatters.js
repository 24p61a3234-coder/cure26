export function minutesLabel(minutes) {
  if (!minutes) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function statusBadge(status) {
  const map = {
    waiting: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    serving: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
  };
  return map[status] || map.waiting;
}
