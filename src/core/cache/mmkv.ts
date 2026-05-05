// Web fallback — uses localStorage instead of MMKV
import type { CachedWeatherData } from '../../features/weather/types';

const CACHE_TTL_MS = 60 * 60 * 1000;

function cityKey(city: string) {
  return `weather:${city.toLowerCase().trim()}`;
}

export function setCachedWeather(city: string, data: Omit<CachedWeatherData, 'cachedAt'>) {
  try {
    const payload: CachedWeatherData = { ...data, cachedAt: Date.now() };
    localStorage.setItem(cityKey(city), JSON.stringify(payload));
  } catch {}
}

export function getCachedWeather(city: string): CachedWeatherData | null {
  try {
    const raw = localStorage.getItem(cityKey(city));
    if (!raw) return null;
    return JSON.parse(raw) as CachedWeatherData;
  } catch {
    return null;
  }
}

export function isCacheStale(cachedAt: number): boolean {
  return Date.now() - cachedAt > CACHE_TTL_MS;
}

export function getCacheAge(cachedAt: number): string {
  const diffMs = Date.now() - cachedAt;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 min ago';
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`;
}
