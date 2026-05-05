import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { colors, fonts, fontSizes, spacing, radius } from '../../../core/theme';
import { ConditionIcon } from '../components/ConditionIcon';
import type { DayForecast, ForecastItem } from '../types';

interface DayDetailSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  day: DayForecast | null;
}

function HourRow({ item, index }: { item: ForecastItem; index: number }) {
  return (
    <View style={styles.hourRow}>
      <Text style={styles.hourTime}>{item.hour}</Text>
      <View style={styles.hourIcon}>
        <ConditionIcon condition={item.condition} size={20} />
      </View>
      <Text style={styles.hourTemp}>{item.temperature}°</Text>
      <Text style={styles.hourRange}>
        {item.tempMin}° / {item.tempMax}°
      </Text>
    </View>
  );
}

export function DayDetailSheet({ bottomSheetRef, day }: DayDetailSheetProps) {
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['60%', '90%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handle}
      animateOnMount
    >
      <BottomSheetView style={styles.header}>
        <View style={styles.headerLeft}>
          {day && <ConditionIcon condition={day.condition} size={28} />}
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.dayLabel}>{day?.dayLabel ?? ''}</Text>
          <Text style={styles.conditionLabel}>{day?.conditionLabel ?? ''}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.highTemp}>{day?.tempHigh ?? '--'}°</Text>
          <Text style={styles.lowTemp}>{day?.tempLow ?? '--'}°</Text>
        </View>
      </BottomSheetView>

      <BottomSheetFlatList
        data={day?.hourly ?? []}
        keyExtractor={(item) => item.dt.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => <HourRow item={item} index={index} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No hourly data available</Text>
        }
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.surface,
  },
  handle: {
    backgroundColor: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    marginRight: spacing.md,
  },
  headerCenter: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  dayLabel: {
    fontFamily: fonts.sansBold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
  },
  conditionLabel: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  highTemp: {
    fontFamily: fonts.monoRegular,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
  },
  lowTemp: {
    fontFamily: fonts.monoRegular,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  hourRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  hourTime: {
    width: 64,
    fontFamily: fonts.monoRegular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  hourIcon: {
    width: 32,
    alignItems: 'center',
  },
  hourTemp: {
    flex: 1,
    fontFamily: fonts.monoRegular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  hourRange: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  empty: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
