import { useQuery } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { fetchForecast, fetchForecastByCoords } from '../../../core/api';
import { getCachedWeather, setCachedWeather } from '../../../core/cache';
import type { DayForecast } from '../types';

interface UseForecastOptions {
  city?: string;
  lat?: number;
  lon?: number;
}

export function useForecast({ city, lat, lon }: UseForecastOptions) {
  const queryKey = city ? ['forecast', 'city', city] : ['forecast', 'coords', lat, lon];
  const cacheKey = city ?? `${lat},${lon}`;

  return useQuery<DayForecast[]>({
    queryKey,
    queryFn: async () => {
      const net = await NetInfo.fetch();

      if (!net.isConnected) {
        const cached = getCachedWeather(cacheKey);
        if (cached?.forecast?.length) return cached.forecast;
        throw new Error('NO_INTERNET');
      }

      const forecast = city
        ? await fetchForecast(city)
        : await fetchForecastByCoords(lat!, lon!);

      const existing = getCachedWeather(cacheKey);
      if (existing) {
        setCachedWeather(cacheKey, { ...existing, forecast });
      }

      return forecast;
    },
    staleTime: 10 * 60 * 1000,
    retry: (failCount, error: any) => {
      if (error?.name === 'NotFoundError') return false;
      if (error?.message === 'NO_INTERNET') return false;
      return failCount < 2;
    },
    enabled: !!(city || (lat !== undefined && lon !== undefined)),
  });
}
