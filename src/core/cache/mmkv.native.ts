import { MMKV } from 'react-native-mmkv';
import type { CachedWeatherData } from '../../features/weather/types';

const storage = new MMKV({ id: 'dead-of-night-cache' });

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function cityKey(city: string) {
  return `weather:${city.toLowerCase().trim()}`;
}

export function setCachedWeather(city: string, data: Omit<CachedWeatherData, 'cachedAt'>) {
  const payload: CachedWeatherData = { ...data, cachedAt: Date.now() };
  storage.set(cityKey(city), JSON.stringify(payload));
}

export function getCachedWeather(city: string): CachedWeatherData | null {
  const raw = storage.getString(cityKey(city));
  if (!raw) return null;
  try {
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
