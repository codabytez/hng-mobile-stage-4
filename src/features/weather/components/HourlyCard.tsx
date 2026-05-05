import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { colors, spacing, radius, fonts, fontSizes } from '../../../core/theme';
import { ConditionIcon } from './ConditionIcon';
import type { ForecastItem } from '../types';

interface HourlyCardProps {
  item: ForecastItem;
  index: number;
  isCurrentHour: boolean;
}

export function HourlyCard({ item, index, isCurrentHour }: HourlyCardProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: index * 30 }}
      style={[styles.card, isCurrentHour && styles.activeCard]}
    >
      <Text style={styles.time}>{item.hour}</Text>
      <View style={styles.icon}>
        <ConditionIcon condition={item.condition} size={20} />
      </View>
      <Text style={styles.temp}>{item.temperature}°</Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 60,
    height: 90,
    borderRadius: radius.lg,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginRight: spacing.sm,
    paddingVertical: spacing.xs,
  },
  activeCard: {
    borderColor: colors.accentCold,
    shadowColor: colors.accentCold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  time: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  temp: {
    fontFamily: fonts.monoRegular,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
});
