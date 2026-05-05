import axios from 'axios';
import { NetworkError, NotFoundError, RateLimitError, ApiError } from './errors';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  params: {
    appid: process.env.EXPO_PUBLIC_OWM_API_KEY ?? 'PLACEHOLDER_API_KEY',
    units: 'metric',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new NetworkError());
    }

    const status = error.response?.status;

    if (status === 404) {
      return Promise.reject(new NotFoundError());
    }

    if (status === 429) {
      return Promise.reject(new RateLimitError());
    }

    return Promise.reject(
      new ApiError(
        error.response?.data?.message ?? 'An unexpected error occurred',
        status,
      ),
    );
  },
);
