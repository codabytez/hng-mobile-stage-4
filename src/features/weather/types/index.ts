export type Condition =
  | 'clear'
  | 'clouds'
  | 'rain'
  | 'drizzle'
  | 'thunderstorm'
  | 'snow'
  | 'mist'
  | 'unknown';

export interface WeatherResponse {
  city: string;
  countryCode: string;
  temperature: number;
  feelsLike: number;
  condition: Condition;
  conditionLabel: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  iconCode: string;
  timestamp: number;
}

export interface ForecastItem {
  dt: number;
  temperature: number;
  tempMin: number;
  tempMax: number;
  condition: Condition;
  conditionLabel: string;
  iconCode: string;
  hour: string;
  dayLabel: string;
}

export interface DayForecast {
  date: string;
  dayLabel: string;
  tempHigh: number;
  tempLow: number;
  condition: Condition;
  conditionLabel: string;
  iconCode: string;
  hourly: ForecastItem[];
}

export interface CachedWeatherData {
  weather: WeatherResponse;
  forecast: DayForecast[];
  cachedAt: number;
}
