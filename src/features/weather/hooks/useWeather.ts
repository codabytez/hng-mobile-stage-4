import { useQuery } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { fetchCurrentWeather, fetchCurrentWeatherByCoords } from '../../../core/api';
import { getCachedWeather, setCachedWeather, isCacheStale, getCacheAge } from '../../../core/cache';
import type { WeatherResponse } from '../types';

interface UseWeatherOptions {
  city?: string;
  lat?: number;
  lon?: number;
}

export function useWeather({ city, lat, lon }: UseWeatherOptions) {
  const queryKey = city ? ['weather', 'city', city] : ['weather', 'coords', lat, lon];
  const cacheKey = city ?? `${lat},${lon}`;

  return useQuery<WeatherResponse & { fromCache?: boolean; cacheAge?: string }>({
    queryKey,
    queryFn: async () => {
      const net = await NetInfo.fetch();

      if (!net.isConnected) {
        const cached = getCachedWeather(cacheKey);
        if (cached) {
          return {
            ...cached.weather,
            fromCache: true,
            cacheAge: getCacheAge(cached.cachedAt),
          };
        }
        throw new Error('NO_INTERNET');
      }

      const data = city
        ? await fetchCurrentWeather(city)
        : await fetchCurrentWeatherByCoords(lat!, lon!);

      setCachedWeather(cacheKey, {
        weather: data,
        forecast: [],
      });

      return data;
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
