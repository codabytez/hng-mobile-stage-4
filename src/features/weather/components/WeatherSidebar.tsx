import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Keyboard,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { colors, fonts, fontSizes, spacing, radius } from '../../../core/theme';
import { HourlyCard } from './HourlyCard';
import { ForecastRow } from './ForecastRow';
import { StatsTile } from './StatsTile';
import { ConditionIcon } from './ConditionIcon';
import { ContextMenuTrigger } from './ContextMenu';
import { HourlyCardSkeleton, ForecastRowSkeleton, StatsTileSkeleton } from './SkeletonCard';
import { useWeatherStore, convertTemp, convertWind, tempLabel } from '../store/useWeatherStore';
import type { WeatherResponse, DayForecast, ForecastItem } from '../types';

interface WeatherSidebarProps {
  weather: (WeatherResponse & { fromCache?: boolean; cacheAge?: string }) | undefined;
  forecast: DayForecast[];
  isLoading: boolean;
  onSelectCity: (city: string) => void;
  onDayPress: (day: DayForecast) => void;
  searchInputRef?: React.RefObject<TextInput>;
}

function getCurrentHour(): string {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}

export function WeatherSidebar({
  weather,
  forecast,
  isLoading,
  onSelectCity,
  onDayPress,
  searchInputRef,
}: WeatherSidebarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const { recentSearches, popularCities, tempUnit, windUnit } = useWeatherStore();

  // Slide-in animation on mount
  const translateX = useSharedValue(40);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withSpring(0, { damping: 20, stiffness: 120 });
    opacity.value = withSpring(1, { damping: 20 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (text.trim().length >= 2) {
        setResults(
          [...recentSearches, ...popularCities].filter((c) =>
            c.toLowerCase().includes(text.toLowerCase()),
          ),
        );
      } else {
        setResults([]);
      }
    },
    [recentSearches, popularCities],
  );

  const handleSelect = useCallback(
    (city: string) => {
      setQuery('');
      setResults([]);
      Keyboard.dismiss();
      onSelectCity(city);
    },
    [onSelectCity],
  );

  const todayHourly: ForecastItem[] = forecast[0]?.hourly ?? [];
  const currentHour = getCurrentHour();

  return (
    <Animated.View style={[styles.sidebar, animStyle]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            value={query}
            onChangeText={handleSearch}
            placeholder="Search city..."
            placeholderTextColor={colors.textSecondary}
            returnKeyType="search"
            onSubmitEditing={() => { if (query.trim()) handleSelect(query.trim()); }}
            autoCorrect={false}
            autoCapitalize="words"
          />
        </View>

        {/* Search results */}
        {results.length > 0 && (
          <View style={styles.resultsBox}>
            {results.map((city, i) => (
              <MotiView
                key={city}
                from={{ opacity: 0, translateY: 6 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: i * 30, type: 'timing', duration: 200 }}
              >
                <TouchableOpacity
                  style={styles.resultRow}
                  onPress={() => handleSelect(city)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resultText}>{city}</Text>
                </TouchableOpacity>
              </MotiView>
            ))}
          </View>
        )}

        {/* Quick city chips */}
        {query.length === 0 && (
          <View style={styles.chipsRow}>
            {popularCities.map((city, i) => (
              <TouchableOpacity
                key={city}
                style={styles.chip}
                onPress={() => handleSelect(city)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipText}>{city}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Hourly */}
        <Text style={styles.sectionLabel}>Hourly</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hourlyList}
          data={isLoading ? Array(8).fill(null) : todayHourly}
          keyExtractor={(item, i) => (item ? item.dt.toString() : `sk-${i}`)}
          renderItem={({ item, index }) =>
            isLoading || !item ? (
              <HourlyCardSkeleton index={index} />
            ) : (
              <HourlyCard item={item} index={index} isCurrentHour={item.hour === currentHour} />
            )
          }
          scrollEnabled
        />

        {/* Stats */}
        <View style={styles.statsGrid}>
          {isLoading ? (
            <>
              <StatsTileSkeleton />
              <StatsTileSkeleton />
              <StatsTileSkeleton />
              <StatsTileSkeleton />
            </>
          ) : (
            <>
              <StatsTile type="humidity" value={weather?.humidity ?? 0} unit="%" label="Humidity" />
              <StatsTile
                type="wind"
                value={convertWind(weather?.windSpeed ?? 0, windUnit)}
                unit={` ${windUnit}`}
                label="Wind"
              />
              <StatsTile type="uv" value={weather?.uvIndex ?? 0} unit="" label="UV Index" />
              <StatsTile
                type="feelsLike"
                value={convertTemp(weather?.feelsLike ?? 0, tempUnit)}
                unit={tempLabel(tempUnit)}
                label="Feels Like"
              />
            </>
          )}
        </View>

        {/* 5-day forecast */}
        <Text style={styles.sectionLabel}>5-Day Forecast</Text>
        {isLoading
          ? Array(5).fill(null).map((_, i) => <ForecastRowSkeleton key={i} index={i} />)
          : forecast.map((day) => (
              <ContextMenuTrigger
                key={day.date}
                items={[
                  { label: 'View hourly breakdown', onPress: () => onDayPress(day) },
                  {
                    label: `Copy temperature: ${convertTemp(day.tempHigh, tempUnit)}${tempLabel(tempUnit)}`,
                    onPress: () => {
                      navigator.clipboard?.writeText(
                        `${convertTemp(day.tempHigh, tempUnit)}${tempLabel(tempUnit)}`,
                      );
                    },
                  },
                ]}
              >
                <ForecastRow item={day} onPress={() => onDayPress(day)} />
              </ContextMenuTrigger>
            ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 380,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    // @ts-ignore
    height: '100%',
    overflow: 'hidden',
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  searchWrapper: {
    margin: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
  },
  searchInput: {
    height: 44,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    // @ts-ignore
    outlineStyle: 'none',
  },
  resultsBox: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  resultRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultText: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface2,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  sectionLabel: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  hourlyList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
