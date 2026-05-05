import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../../../core/theme';
import { useWeatherStore } from '../store/useWeatherStore';

interface MenuItem {
  label: string;
  shortcut?: string;
  onPress: () => void;
  separator?: boolean;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

interface Props {
  onRefresh: () => void;
  onFocusSearch: () => void;
  onAbout: () => void;
}

function DropdownMenu({ items, onClose }: { items: MenuItem[]; onClose: () => void }) {
  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [onClose]);

  return (
    <View style={styles.dropdown}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {item.separator && i > 0 && <View style={styles.separator} />}
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { item.onPress(); onClose(); }}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownLabel}>{item.label}</Text>
            {item.shortcut && (
              <Text style={styles.dropdownShortcut}>{item.shortcut}</Text>
            )}
          </TouchableOpacity>
        </React.Fragment>
      ))}
    </View>
  );
}

export function AppMenuBar({ onRefresh, onFocusSearch, onAbout }: Props) {
  if (Platform.OS !== 'web') return null;

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { toggleTempUnit, toggleWindUnit, tempUnit, windUnit } = useWeatherStore();

  const menus: MenuGroup[] = [
    {
      label: 'File',
      items: [
        { label: 'Refresh Weather', shortcut: '⌘R', onPress: onRefresh },
        { label: 'Quit', separator: true, onPress: () => window.close() },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Search City', shortcut: '⌘K', onPress: onFocusSearch },
      ],
    },
    {
      label: 'View',
      items: [
        {
          label: `Temperature: °${tempUnit} → switch`,
          shortcut: '⌘T',
          onPress: toggleTempUnit,
        },
        {
          label: `Wind: ${windUnit} → switch`,
          onPress: toggleWindUnit,
        },
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'About Dead of Night', onPress: onAbout },
        {
          label: 'Report Issue',
          separator: true,
          onPress: () => window.open('https://github.com', '_blank'),
        },
      ],
    },
  ];

  const toggle = (label: string) =>
    setOpenMenu((prev) => (prev === label ? null : label));

  return (
    <View style={styles.bar}>
      <Text style={styles.appName}>Dead of Night</Text>
      <View style={styles.menus}>
        {menus.map((menu) => (
          <View key={menu.label} style={styles.menuWrapper}>
            <TouchableOpacity
              style={[styles.menuTrigger, openMenu === menu.label && styles.menuTriggerActive]}
              onPress={(e) => { (e as any).stopPropagation?.(); toggle(menu.label); }}
              activeOpacity={0.8}
            >
              <Text style={styles.menuLabel}>{menu.label}</Text>
            </TouchableOpacity>
            {openMenu === menu.label && (
              <DropdownMenu items={menu.items} onClose={() => setOpenMenu(null)} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 36,
    backgroundColor: 'rgba(8,12,20,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    // @ts-ignore
    backdropFilter: 'blur(12px)',
    zIndex: 1000,
  },
  appName: {
    fontFamily: fonts.sansBold,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginRight: spacing.lg,
  },
  menus: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  menuWrapper: {
    position: 'relative',
  },
  menuTrigger: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  menuTriggerActive: {
    backgroundColor: colors.surface2,
  },
  menuLabel: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  dropdown: {
    position: 'absolute',
    top: 28,
    left: 0,
    minWidth: 220,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.xs,
    // @ts-ignore
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    zIndex: 2000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  dropdownLabel: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  dropdownShortcut: {
    fontFamily: fonts.monoRegular,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.sm,
  },
});
