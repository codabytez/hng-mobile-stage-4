import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { colors, fonts, fontSizes, spacing, radius } from '../../../core/theme';

type StatType = 'humidity' | 'wind' | 'uv' | 'feelsLike';

interface StatsTileProps {
  type: StatType;
  value: number;
  unit: string;
  label: string;
}

function StatIcon({ type }: { type: StatType }) {
  const stroke = colors.accentCold;
  const size = 20;
  switch (type) {
    case 'humidity':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 2L6 12a6 6 0 1 0 12 0L12 2z" stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'wind':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M9.59 4.59A2 2 0 1 1 11 8H2" stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M12.59 19.41A2 2 0 1 0 14 16H2" stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M2 12h15a2 2 0 0 0 0-4" stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'uv':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="4" stroke={colors.accentWarm} strokeWidth="2" fill="none" />
          <Line x1="12" y1="2" x2="12" y2="5" stroke={colors.accentWarm} strokeWidth="2" strokeLinecap="round" />
          <Line x1="12" y1="19" x2="12" y2="22" stroke={colors.accentWarm} strokeWidth="2" strokeLinecap="round" />
          <Line x1="2" y1="12" x2="5" y2="12" stroke={colors.accentWarm} strokeWidth="2" strokeLinecap="round" />
          <Line x1="19" y1="12" x2="22" y2="12" stroke={colors.accentWarm} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );
    case 'feelsLike':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
  }
}

export function StatsTile({ type, value, unit, label }: StatsTileProps) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({} as any));

  return (
    <View style={styles.tile}>
      <StatIcon type={type} />
      <AnimatedValue animatedValue={animatedValue} unit={unit} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function AnimatedValue({ animatedValue, unit }: { animatedValue: any; unit: string }) {
  const [display, setDisplay] = React.useState(0);

  useEffect(() => {
    let frame: number;
    const start = Date.now();
    const target = animatedValue.value;
    const duration = 1200;

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animatedValue.value]);

  return (
    <Text style={styles.value}>
      {display}
      <Text style={styles.unit}>{unit}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'flex-start',
    gap: spacing.xs,
    margin: spacing.xs / 2,
  },
  value: {
    fontFamily: fonts.monoRegular,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
  },
  unit: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
});
