export type BlogMetrics = { views: number; totalSeconds: number; averageSeconds: number };

export const EMPTY_BLOG_METRICS: BlogMetrics = { views: 0, totalSeconds: 0, averageSeconds: 0 };

export function formatReadingTime(seconds: number): string {
  const rounded = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return minutes ? `${minutes}m ${remainder}s` : `${remainder}s`;
}
