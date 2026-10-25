export function getTrafficColor(status: string): string {
  switch (status) {
    case 'LOW': return '#22c55e';
    case 'MODERATE': return '#f59e0b';
    case 'HIGH': return '#f97316';
    case 'SEVERE': return '#ef4444';
    default: return '#94a3b8';
  }
}

export function getTrafficBadgeClass(status: string): string {
  switch (status) {
    case 'LOW': return 'badge-low';
    case 'MODERATE': return 'badge-moderate';
    case 'HIGH': return 'badge-high';
    case 'SEVERE': return 'badge-severe';
    default: return 'badge-default';
  }
}

export function getParkingStatusColor(status: string): string {
  switch (status) {
    case 'AVAILABLE': return '#22c55e';
    case 'NEARLY_FULL': return '#f97316';
    case 'CRITICAL': return '#ef4444';
    case 'FULL': return '#7f1d1d';
    default: return '#94a3b8';
  }
}

export function getRiskLevel(score: number): { label: string; color: string; bg: string } {
  if (score <= 25) return { label: 'LOW', color: '#22c55e', bg: '#052e16' };
  if (score <= 50) return { label: 'MODERATE', color: '#f59e0b', bg: '#451a03' };
  if (score <= 75) return { label: 'HIGH', color: '#f97316', bg: '#431407' };
  return { label: 'SEVERE', color: '#ef4444', bg: '#450a0a' };
}

export function getUtilizationColor(pct: number): string {
  if (pct >= 95) return '#ef4444';
  if (pct >= 80) return '#f97316';
  if (pct >= 60) return '#f59e0b';
  return '#22c55e';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
  });
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

export function getCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    CONCERT: '🎵', SPORTS: '🏏', EXHIBITION: '🖼️', CULTURAL: '🎭',
    CONFERENCE: '💼', FESTIVAL: '🎉', RELIGIOUS: '🙏', FAIR: '🎡',
    CORPORATE: '🏢', OTHER: '📅'
  };
  return map[category] || '📅';
}

export function getGateStatusColor(status: string): string {
  switch (status) {
    case 'OPEN': return '#22c55e';
    case 'BUSY': return '#f59e0b';
    case 'CONGESTED': return '#ef4444';
    case 'CLOSED': return '#6b7280';
    default: return '#94a3b8';
  }
}

export function calcUtilization(occupied: number, capacity: number): number {
  if (!capacity) return 0;
  return Math.round((occupied / capacity) * 100);
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

// Alias used by some pages
export const getTrafficRiskLevel = getRiskLevel;
