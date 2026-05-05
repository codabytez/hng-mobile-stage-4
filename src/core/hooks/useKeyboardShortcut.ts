import { useEffect } from 'react';
import { Platform } from 'react-native';

type Modifier = 'ctrl' | 'meta' | 'ctrlOrMeta';

interface ShortcutOptions {
  key: string;
  modifier?: Modifier;
  onPress: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcut({ key, modifier = 'ctrlOrMeta', onPress, enabled = true }: ShortcutOptions) {
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) return;

    const handler = (e: KeyboardEvent) => {
      const modMatch =
        modifier === 'ctrlOrMeta'
          ? e.ctrlKey || e.metaKey
          : modifier === 'ctrl'
          ? e.ctrlKey
          : e.metaKey;

      if (modMatch && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        onPress();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, modifier, onPress, enabled]);
}

// Register multiple shortcuts at once
export function useKeyboardShortcuts(shortcuts: ShortcutOptions[]) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handler = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;
        const { key, modifier = 'ctrlOrMeta', onPress } = shortcut;
        const modMatch =
          modifier === 'ctrlOrMeta'
            ? e.ctrlKey || e.metaKey
            : modifier === 'ctrl'
            ? e.ctrlKey
            : e.metaKey;

        if (modMatch && e.key.toLowerCase() === key.toLowerCase()) {
          e.preventDefault();
          onPress();
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
