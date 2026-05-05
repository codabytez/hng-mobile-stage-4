import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export type LocationState =
  | { status: 'loading' }
  | { status: 'granted'; lat: number; lon: number }
  | { status: 'denied' }
  | { status: 'error'; message: string };

export function useLocation() {
  const [state, setState] = useState<LocationState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;

        if (status !== 'granted') {
          setState({ status: 'denied' });
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setState({
            status: 'granted',
            lat: loc.coords.latitude,
            lon: loc.coords.longitude,
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          setState({ status: 'error', message: e.message ?? 'Location unavailable' });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
