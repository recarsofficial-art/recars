export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return '₹' + amount.toLocaleString('en-IN');
}

export function formatLakh(amount: number): string {
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2).replace(/\.00$/, '');
    return `₹${cr} Cr`;
  }
  if (amount >= 100000) {
    const lakh = (amount / 100000).toFixed(2).replace(/\.00$/, '');
    return `₹${lakh} Lakh`;
  }
  return formatINR(amount);
}

export function formatKM(km: number): string {
  return `${km.toLocaleString('en-IN')} km`;
}

export function calculateEMI(principal: number, interestRateAnnual: number = 9.5, tenureMonths: number = 60): number {
  const monthlyRate = interestRateAnnual / (12 * 100);
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
}

export function formatDateWithDay(dateString?: string | null): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return String(dateString);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(dateString?: string | null): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return 'Recently';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Recently';
  const now = new Date();
  
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfD = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const calendarDaysDiff = Math.round((startOfNow - startOfD) / (1000 * 60 * 60 * 24));

  if (calendarDaysDiff === 0) {
    const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMins = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
      return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
    }
    return `Today (${diffHours}h ago)`;
  }
  if (calendarDaysDiff === 1) return 'Yesterday';
  if (calendarDaysDiff > 1 && calendarDaysDiff < 7) return `${calendarDaysDiff} days ago`;
  if (calendarDaysDiff >= 7 && calendarDaysDiff < 30) {
    const weeks = Math.floor(calendarDaysDiff / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  const months = Math.floor(calendarDaysDiff / 30);
  return `${months} ${months === 1 ? 'month' : 'months'} ago`;
}

export function formatDateTimeWithDay(dateString?: string | null): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return String(dateString);
  const datePart = formatDateWithDay(dateString);
  const timePart = formatTime(dateString);
  return timePart ? `${datePart} • ${timePart}` : datePart;
}

