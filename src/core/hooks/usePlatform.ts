import { useWindowDimensions } from 'react-native';

export type PlatformSize = 'mobile' | 'tablet' | 'desktop';

export function usePlatform(): PlatformSize {
  const { width } = useWindowDimensions();
  if (width >= 1024) return 'desktop';
  if (width >= 768) return 'tablet';
  return 'mobile';
}
