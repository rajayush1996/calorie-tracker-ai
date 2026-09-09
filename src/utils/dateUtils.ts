export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string): { label: string; subLabel: string; isToday: boolean; isYesterday: boolean } {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName = dayNames[date.getDay()];
  const monthName = monthNames[date.getMonth()];
  const dateNum = date.getDate();

  const isToday = dateStr === today;
  const isYesterday = dateStr === yesterday;

  let label = `${dayName}, ${dateNum} ${monthName}`;
  let subLabel = `${y}`;

  if (isToday) {
    label = 'Today';
    subLabel = `${dayName}, ${dateNum} ${monthName}`;
  } else if (isYesterday) {
    label = 'Yesterday';
    subLabel = `${dayName}, ${dateNum} ${monthName}`;
  }

  return { label, subLabel, isToday, isYesterday };
}
