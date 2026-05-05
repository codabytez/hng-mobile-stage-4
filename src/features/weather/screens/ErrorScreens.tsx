import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { colors, fonts, fontSizes, spacing, radius } from '../../../core/theme';

interface ErrorScreenProps {
  onRetry?: () => void;
  onSearch?: () => void;
}

function NoWifi() {
  return (
    <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
      <Path d="M1 1l22 22" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
      <Path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
      <Path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
      <Path d="M10.71 5.05A16 16 0 0 1 22.56 9" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
      <Path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
      <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="12" cy="20" r="1" fill={colors.textSecondary} />
    </Svg>
  );
}

function LocationDenied() {
  return (
    <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="10" r="3" stroke={colors.textSecondary} strokeWidth="2" />
      <Line x1="4" y1="4" x2="20" y2="20" stroke={colors.accentStorm} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function NotFound() {
  return (
    <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={colors.textSecondary} strokeWidth="2" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
      <Line x1="8" y1="11" x2="14" y2="11" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function NoInternetScreen({ onRetry }: ErrorScreenProps) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 20 }}
      style={styles.container}
    >
      <NoWifi />
      <Text style={styles.title}>No Connection</Text>
      <Text style={styles.body}>
        You're offline. Check your connection and try again.
        {'\n'}Showing last cached data if available.
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </MotiView>
  );
}

export function LocationDeniedScreen({ onSearch }: ErrorScreenProps) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 20 }}
      style={styles.container}
    >
      <LocationDenied />
      <Text style={styles.title}>Location Access Denied</Text>
      <Text style={styles.body}>
        We can't detect your location. Search for a city manually to get started.
      </Text>
      {onSearch && (
        <TouchableOpacity style={styles.button} onPress={onSearch} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Search a City</Text>
        </TouchableOpacity>
      )}
    </MotiView>
  );
}

export function NotFoundScreen({ onRetry }: ErrorScreenProps) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 20 }}
      style={styles.container}
    >
      <NotFound />
      <Text style={styles.title}>City Not Found</Text>
      <Text style={styles.body}>
        We couldn't find weather data for this location. Try a different city name.
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </MotiView>
  );
}

export function ApiErrorScreen({ onRetry }: ErrorScreenProps) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 20 }}
      style={styles.container}
    >
      <NotFound />
      <Text style={styles.title}>Something Went Wrong</Text>
      <Text style={styles.body}>
        The weather service is unavailable. Please try again in a moment.
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.accentCold,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  buttonText: {
    fontFamily: fonts.sansMedium,
    fontSize: fontSizes.md,
    color: '#fff',
  },
});
