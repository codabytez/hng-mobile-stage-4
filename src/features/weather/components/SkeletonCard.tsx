import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { colors, radius, spacing } from '../../../core/theme';

function Shimmer({ style }: { style: any }) {
  return (
    <MotiView
      from={{ backgroundColor: colors.surface }}
      animate={{ backgroundColor: colors.surface2 }}
      transition={{
        type: 'timing',
        duration: 800,
        loop: true,
        repeatReverse: true,
      }}
      style={[styles.shimmer, style]}
    />
  );
}

export function HourlyCardSkeleton({ index }: { index: number }) {
  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 30, type: 'timing', duration: 300 }}
      style={styles.hourlyCard}
    >
      <Shimmer style={styles.hourlyTime} />
      <Shimmer style={styles.hourlyIcon} />
      <Shimmer style={styles.hourlyTemp} />
    </MotiView>
  );
}

export function ForecastRowSkeleton({ index }: { index: number }) {
  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 50, type: 'timing', duration: 300 }}
      style={styles.forecastRow}
    >
      <Shimmer style={styles.forecastDay} />
      <Shimmer style={styles.forecastIcon} />
      <Shimmer style={styles.forecastTemps} />
    </MotiView>
  );
}

export function StatsTileSkeleton() {
  return (
    <View style={styles.statsTile}>
      <Shimmer style={styles.statsIcon} />
      <Shimmer style={styles.statsValue} />
      <Shimmer style={styles.statsLabel} />
    </View>
  );
}

export function HeroSkeleton() {
  return (
    <View style={styles.heroContainer}>
      <Shimmer style={styles.heroCity} />
      <Shimmer style={styles.heroTemp} />
      <Shimmer style={styles.heroCondition} />
    </View>
  );
}

const styles = StyleSheet.create({
  shimmer: {
    borderRadius: radius.sm,
  },
  hourlyCard: {
    width: 60,
    height: 90,
    borderRadius: radius.lg,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginRight: spacing.sm,
    paddingVertical: spacing.xs,
  },
  hourlyTime: {
    width: 36,
    height: 10,
  },
  hourlyIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  hourlyTemp: {
    width: 28,
    height: 12,
  },
  forecastRow: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  forecastDay: {
    flex: 1,
    height: 14,
    marginRight: spacing.md,
  },
  forecastIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: spacing.md,
  },
  forecastTemps: {
    width: 60,
    height: 14,
  },
  statsTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    margin: spacing.xs / 2,
  },
  statsIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  statsValue: {
    width: 48,
    height: 20,
  },
  statsLabel: {
    width: 56,
    height: 10,
  },
  heroContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: spacing.sm,
  },
  heroCity: {
    width: 120,
    height: 18,
  },
  heroTemp: {
    width: 160,
    height: 96,
    borderRadius: radius.md,
  },
  heroCondition: {
    width: 100,
    height: 14,
  },
});
