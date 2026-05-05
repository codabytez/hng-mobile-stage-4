import { Platform } from 'react-native';

// Unified storage API that uses MMKV on native and localStorage on web.
// Import this hook instead of touching mmkv or localStorage directly.

let _mmkv: any = null;

function getMmkv() {
  if (_mmkv) return _mmkv;
  // Dynamic require so web bundler never touches the native module
  const { MMKV } = require('react-native-mmkv');
  _mmkv = new MMKV({ id: 'dead-of-night-storage' });
  return _mmkv;
}

export const storage = {
  get(key: string): string | null {
    if (Platform.OS === 'web') {
      try { return localStorage.getItem(key); } catch { return null; }
    }
    return getMmkv().getString(key) ?? null;
  },

  set(key: string, value: string): void {
    if (Platform.OS === 'web') {
      try { localStorage.setItem(key, value); } catch {}
      return;
    }
    getMmkv().set(key, value);
  },

  remove(key: string): void {
    if (Platform.OS === 'web') {
      try { localStorage.removeItem(key); } catch {}
      return;
    }
    getMmkv().delete(key);
  },
};
