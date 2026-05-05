import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../../../core/theme';
import { ConditionIcon } from './ConditionIcon';
import type { DayForecast } from '../types';

interface ForecastRowProps {
  item: DayForecast;
  onPress: () => void;
}

export function ForecastRow({ item, onPress }: ForecastRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.day}>{item.dayLabel}</Text>
      <View style={styles.icon}>
        <ConditionIcon condition={item.condition} size={22} />
      </View>
      <View style={styles.temps}>
        <Text style={styles.high}>{item.tempHigh}°</Text>
        <Text style={styles.divider}> / </Text>
        <Text style={styles.low}>{item.tempLow}°</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  day: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  icon: {
    flex: 1,
    alignItems: 'center',
  },
  temps: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  high: {
    fontFamily: fonts.monoRegular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  divider: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  low: {
    fontFamily: fonts.monoRegular,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
});
