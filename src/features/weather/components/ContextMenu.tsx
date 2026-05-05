import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../../../core/theme';

interface ContextMenuItem {
  label: string;
  onPress: () => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
}

let _setMenu: ((state: ContextMenuState | null) => void) | null = null;

export function showContextMenu(x: number, y: number, items: ContextMenuItem[]) {
  _setMenu?.({ x, y, items });
}

// Mount this once at the root level (in App.tsx or HomeScreen)
export function ContextMenuProvider() {
  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  useEffect(() => {
    _setMenu = setMenu;
    return () => { _setMenu = null; };
  }, []);

  useEffect(() => {
    if (!menu || Platform.OS !== 'web') return;
    const dismiss = () => setMenu(null);
    window.addEventListener('click', dismiss);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') dismiss(); });
    return () => window.removeEventListener('click', dismiss);
  }, [menu]);

  if (!menu || Platform.OS !== 'web') return null;

  return (
    <View
      style={[
        styles.menu,
        // @ts-ignore — position fixed for web
        { position: 'fixed', left: menu.x, top: menu.y },
      ]}
    >
      {menu.items.map((item, i) => (
        <TouchableOpacity
          key={i}
          style={styles.item}
          onPress={(e) => {
            (e as any).stopPropagation?.();
            item.onPress();
            setMenu(null);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.itemText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Wrap any element to give it a right-click context menu on web
interface ContextMenuTriggerProps {
  items: ContextMenuItem[];
  children: React.ReactNode;
  style?: any;
}

export function ContextMenuTrigger({ items, children, style }: ContextMenuTriggerProps) {
  const handleContextMenu = useCallback(
    (e: any) => {
      if (Platform.OS !== 'web') return;
      e.preventDefault();
      e.stopPropagation();
      showContextMenu(e.clientX, e.clientY, items);
    },
    [items],
  );

  if (Platform.OS !== 'web') {
    return <View style={style}>{children}</View>;
  }

  return (
    // @ts-ignore — onContextMenu is a valid web prop
    <View style={style} onContextMenu={handleContextMenu}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    minWidth: 200,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.xs,
    // @ts-ignore
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    zIndex: 9999,
  },
  item: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  itemText: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
});
