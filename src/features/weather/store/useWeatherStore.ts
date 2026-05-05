import { create } from 'zustand';

const POPULAR_CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan'];
const MAX_RECENT = 8;

export type TempUnit = 'C' | 'F';
export type WindUnit = 'kmh' | 'mph';

interface WeatherStore {
  selectedCity: string;
  recentSearches: string[];
  popularCities: string[];
  tempUnit: TempUnit;
  windUnit: WindUnit;
  setSelectedCity: (city: string) => void;
  addRecentSearch: (city: string) => void;
  clearRecentSearches: () => void;
  toggleTempUnit: () => void;
  toggleWindUnit: () => void;
}

export const useWeatherStore = create<WeatherStore>((set) => ({
  selectedCity: 'Lagos',
  recentSearches: [],
  popularCities: POPULAR_CITIES,
  tempUnit: 'C',
  windUnit: 'kmh',

  setSelectedCity: (city) =>
    set((state) => {
      const cleaned = city.trim();
      return {
        selectedCity: cleaned,
        recentSearches: [
          cleaned,
          ...state.recentSearches.filter(
            (c) => c.toLowerCase() !== cleaned.toLowerCase(),
          ),
        ].slice(0, MAX_RECENT),
      };
    }),

  addRecentSearch: (city) =>
    set((state) => ({
      recentSearches: [
        city,
        ...state.recentSearches.filter(
          (c) => c.toLowerCase() !== city.toLowerCase(),
        ),
      ].slice(0, MAX_RECENT),
    })),

  clearRecentSearches: () => set({ recentSearches: [] }),
  toggleTempUnit: () =>
    set((state) => ({ tempUnit: state.tempUnit === 'C' ? 'F' : 'C' })),
  toggleWindUnit: () =>
    set((state) => ({ windUnit: state.windUnit === 'kmh' ? 'mph' : 'kmh' })),
}));

// Pure conversion helpers (no React dependency)
export function convertTemp(celsius: number, unit: TempUnit): number {
  return unit === 'C' ? celsius : Math.round(celsius * 9 / 5 + 32);
}

export function convertWind(kmh: number, unit: WindUnit): number {
  return unit === 'kmh' ? kmh : Math.round(kmh * 0.621371);
}

export function tempLabel(unit: TempUnit): string {
  return `°${unit}`;
}
