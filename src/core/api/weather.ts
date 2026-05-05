import { apiClient } from './client';
import type { Condition, WeatherResponse, DayForecast, ForecastItem } from '../../features/weather/types';

function mapCondition(weatherId: number): Condition {
  if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
  if (weatherId >= 300 && weatherId < 400) return 'drizzle';
  if (weatherId >= 500 && weatherId < 600) return 'rain';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  if (weatherId >= 700 && weatherId < 800) return 'mist';
  if (weatherId === 800) return 'clear';
  if (weatherId > 800) return 'clouds';
  return 'unknown';
}

function formatHour(dt: number): string {
  return new Date(dt * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
  });
}

function formatDay(dt: number): string {
  return new Date(dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
}

function formatDate(dt: number): string {
  return new Date(dt * 1000).toISOString().split('T')[0];
}

export async function fetchCurrentWeather(city: string): Promise<WeatherResponse> {
  const { data } = await apiClient.get('/weather', { params: { q: city } });
  const w = data.weather[0];

  return {
    city: data.name,
    countryCode: data.sys.country,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    condition: mapCondition(w.id),
    conditionLabel: w.description
      .split(' ')
      .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' '),
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind.speed * 3.6),
    uvIndex: 0,
    iconCode: w.icon,
    timestamp: data.dt,
  };
}

export async function fetchCurrentWeatherByCoords(
  lat: number,
  lon: number,
): Promise<WeatherResponse> {
  const { data } = await apiClient.get('/weather', { params: { lat, lon } });
  const w = data.weather[0];

  return {
    city: data.name,
    countryCode: data.sys.country,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    condition: mapCondition(w.id),
    conditionLabel: w.description
      .split(' ')
      .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' '),
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind.speed * 3.6),
    uvIndex: 0,
    iconCode: w.icon,
    timestamp: data.dt,
  };
}

export async function fetchForecast(city: string): Promise<DayForecast[]> {
  const { data } = await apiClient.get('/forecast', { params: { q: city } });
  return groupForecastByDay(data.list);
}

export async function fetchForecastByCoords(
  lat: number,
  lon: number,
): Promise<DayForecast[]> {
  const { data } = await apiClient.get('/forecast', { params: { lat, lon } });
  return groupForecastByDay(data.list);
}

function groupForecastByDay(list: any[]): DayForecast[] {
  const dayMap = new Map<string, ForecastItem[]>();

  for (const item of list) {
    const dateKey = formatDate(item.dt);
    if (!dayMap.has(dateKey)) dayMap.set(dateKey, []);

    dayMap.get(dateKey)!.push({
      dt: item.dt,
      temperature: Math.round(item.main.temp),
      tempMin: Math.round(item.main.temp_min),
      tempMax: Math.round(item.main.temp_max),
      condition: mapCondition(item.weather[0].id),
      conditionLabel: item.weather[0].description,
      iconCode: item.weather[0].icon,
      hour: formatHour(item.dt),
      dayLabel: formatDay(item.dt),
    });
  }

  const today = formatDate(Date.now() / 1000);
  const days: DayForecast[] = [];

  for (const [date, items] of dayMap.entries()) {
    const temps = items.map((i) => i.temperature);
    const dominant = items[Math.floor(items.length / 2)];

    days.push({
      date,
      dayLabel: date === today ? 'Today' : formatDay(items[0].dt),
      tempHigh: Math.max(...temps),
      tempLow: Math.min(...temps),
      condition: dominant.condition,
      conditionLabel: dominant.conditionLabel,
      iconCode: dominant.iconCode,
      hourly: items,
    });
  }

  return days.slice(0, 5);
}
