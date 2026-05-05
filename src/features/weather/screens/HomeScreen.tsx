import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Circle } from 'react-native-svg';

import { colors, fonts, fontSizes, spacing, radius } from '../../../core/theme';
import { WeatherBackground } from '../components/WeatherBackground';
import { HourlyCard } from '../components/HourlyCard';
import { ForecastRow } from '../components/ForecastRow';
import { StatsTile } from '../components/StatsTile';
import {
  HourlyCardSkeleton,
  ForecastRowSkeleton,
  StatsTileSkeleton,
  HeroSkeleton,
} from '../components/SkeletonCard';
import { WeatherSidebar } from '../components/WeatherSidebar';
import { AppMenuBar } from '../components/AppMenuBar';
import { ContextMenuProvider, ContextMenuTrigger } from '../components/ContextMenu';
import { DayDetailSheet } from './DayDetailSheet';
import {
  NoInternetScreen,
  LocationDeniedScreen,
  NotFoundScreen,
  ApiErrorScreen,
} from './ErrorScreens';
import { useWeather } from '../hooks/useWeather';
import { useForecast } from '../hooks/useForecast';
import { useLocation } from '../hooks/useLocation';
import { useWeatherStore, convertTemp, convertWind, tempLabel } from '../store/useWeatherStore';
import { useKeyboardShortcuts } from '../../../core/hooks/useKeyboardShortcut';
import { usePlatform } from '../../../core/hooks/usePlatform';
import { NetworkError, NotFoundError } from '../../../core/api';
import type { DayForecast } from '../types';

// Mobile-only: lazy import bottom sheet to avoid web worklet warnings
let BottomSheet: any = null;
let BottomSheetScrollView: any = null;
let SearchSheet: any = null;

if (Platform.OS !== 'web') {
  const bs = require('@gorhom/bottom-sheet');
  BottomSheet = bs.BottomSheet;
  BottomSheetScrollView = bs.BottomSheetScrollView;
  SearchSheet = require('./SearchSheet').SearchSheet;
}

function SearchIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={colors.textSecondary} strokeWidth="2" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function getCurrentHour(): string {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}

// Hover-aware forecast row (web only)
function HoverForecastRow({ item, onDayPress }: { item: DayForecast; onDayPress: (d: DayForecast) => void }) {
  const [hovered, setHovered] = useState(false);
  const { tempUnit } = useWeatherStore();

  if (Platform.OS !== 'web') {
    return (
      <ContextMenuTrigger
        items={[
          { label: 'View hourly breakdown', onPress: () => onDayPress(item) },
          { label: `Copy temperature: ${convertTemp(item.tempHigh, tempUnit)}${tempLabel(tempUnit)}`, onPress: () => navigator.clipboard?.writeText(`${convertTemp(item.tempHigh, tempUnit)}${tempLabel(tempUnit)}`) },
        ]}
      >
        <ForecastRow item={item} onPress={() => onDayPress(item)} />
      </ContextMenuTrigger>
    );
  }

  return (
    <ContextMenuTrigger
      items={[
        { label: 'View hourly breakdown', onPress: () => onDayPress(item) },
        { label: `Copy temperature: ${convertTemp(item.tempHigh, tempUnit)}${tempLabel(tempUnit)}`, onPress: () => navigator.clipboard?.writeText(`${convertTemp(item.tempHigh, tempUnit)}${tempLabel(tempUnit)}`) },
      ]}
      style={{
        // @ts-ignore
        transition: 'background-color 150ms ease',
        backgroundColor: hovered ? colors.surface2 : 'transparent',
        cursor: 'pointer',
      }}
    >
      <View
        // @ts-ignore
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <ForecastRow item={item} onPress={() => onDayPress(item)} />
      </View>
    </ContextMenuTrigger>
  );
}

export function HomeScreen() {
  const platform = usePlatform();
  const isMobile = platform === 'mobile';
  const { selectedCity, setSelectedCity, tempUnit, windUnit, toggleTempUnit } = useWeatherStore();
  const location = useLocation();

  const useCoords = location.status === 'granted' && !selectedCity;

  const weatherQuery = useWeather(
    useCoords
      ? { lat: (location as any).lat, lon: (location as any).lon }
      : { city: selectedCity },
  );

  const forecastQuery = useForecast(
    useCoords
      ? { lat: (location as any).lat, lon: (location as any).lon }
      : { city: selectedCity },
  );

  // Mobile refs
  const persistentSheetRef = useRef<any>(null);
  const searchSheetRef = useRef<any>(null);
  const detailSheetRef = useRef<any>(null);
  // Desktop search input
  const desktopSearchRef = useRef<TextInput>(null);

  const [selectedDay, setSelectedDay] = useState<DayForecast | null>(null);
  const [showAbout, setShowAbout] = useState(false);

  // Temperature transition animation
  const tempTranslateY = useSharedValue(0);
  const tempOpacity = useSharedValue(1);
  const tempAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: tempTranslateY.value }],
    opacity: tempOpacity.value,
  }));

  // Update browser tab title on web
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const temp = weatherQuery.data?.temperature;
    const city = weatherQuery.data?.city ?? selectedCity;
    document.title = temp
      ? `${city} · ${convertTemp(temp, tempUnit)}${tempLabel(tempUnit)} — Dead of Night Weather`
      : 'Dead of Night Weather';
  }, [weatherQuery.data, selectedCity, tempUnit]);

  // Keyboard shortcuts (web/desktop)
  useKeyboardShortcuts([
    { key: 'k', onPress: () => desktopSearchRef.current?.focus() },
    { key: 'r', onPress: () => weatherQuery.refetch() },
    { key: 'l', onPress: () => { /* location re-fetch handled by useLocation */ } },
    { key: 't', onPress: toggleTempUnit },
    { key: 'd', onPress: () => { /* future: dark/light toggle */ } },
  ]);

  const handleCitySelect = useCallback(
    (city: string) => {
      tempOpacity.value = withTiming(0, { duration: 150 });
      tempTranslateY.value = withTiming(-20, { duration: 150 });
      setSelectedCity(city);
      setTimeout(() => {
        tempTranslateY.value = 20;
        tempOpacity.value = withSpring(1, { damping: 18 });
        tempTranslateY.value = withSpring(0, { damping: 18 });
      }, 160);
    },
    [setSelectedCity],
  );

  const handleDayPress = useCallback((day: DayForecast) => {
    setSelectedDay(day);
    if (isMobile && detailSheetRef.current) {
      detailSheetRef.current.expand();
    }
  }, [isMobile]);

  const openSearch = useCallback(() => {
    if (isMobile && searchSheetRef.current) {
      searchSheetRef.current.expand();
    } else {
      desktopSearchRef.current?.focus();
    }
  }, [isMobile]);

  // Error routing
  const weatherError = weatherQuery.error as any;
  const isNoInternet = weatherError?.name === 'NetworkError' || weatherError?.message === 'NO_INTERNET';
  const isNotFound = weatherError?.name === 'NotFoundError';
  const isLocationDenied = location.status === 'denied' && !selectedCity;

  if (isLocationDenied) {
    return (
      <View style={styles.root}>
        <WeatherBackground condition="unknown" />
        <LocationDeniedScreen onSearch={openSearch} />
        {isMobile && SearchSheet && (
          <SearchSheet bottomSheetRef={searchSheetRef} onSelectCity={handleCitySelect} />
        )}
      </View>
    );
  }

  if (isNoInternet && !weatherQuery.data) {
    return (
      <View style={styles.root}>
        <WeatherBackground condition="unknown" />
        <NoInternetScreen onRetry={() => weatherQuery.refetch()} />
      </View>
    );
  }

  if (isNotFound) {
    return (
      <View style={styles.root}>
        <WeatherBackground condition="unknown" />
        <NotFoundScreen onRetry={openSearch} />
        {isMobile && SearchSheet && (
          <SearchSheet bottomSheetRef={searchSheetRef} onSelectCity={handleCitySelect} />
        )}
      </View>
    );
  }

  if (weatherError && !isNoInternet && !isNotFound && !weatherQuery.data) {
    return (
      <View style={styles.root}>
        <WeatherBackground condition="unknown" />
        <ApiErrorScreen onRetry={() => weatherQuery.refetch()} />
      </View>
    );
  }

  const weather = weatherQuery.data;
  const forecast = forecastQuery.data ?? [];
  const condition = weather?.condition ?? 'unknown';
  const todayHourly = forecast[0]?.hourly ?? [];
  const currentHour = getCurrentHour();
  const isLoading = weatherQuery.isLoading;
  const displayTemp = weather ? convertTemp(weather.temperature, tempUnit) : null;
  const displayFeelsLike = weather ? convertTemp(weather.feelsLike, tempUnit) : 0;
  const displayWind = weather ? convertWind(weather.windSpeed, windUnit) : 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* App menu bar — desktop/web only */}
      {!isMobile && (
        <AppMenuBar
          onRefresh={() => weatherQuery.refetch()}
          onFocusSearch={() => desktopSearchRef.current?.focus()}
          onAbout={() => setShowAbout(true)}
        />
      )}

      <View style={[styles.body, !isMobile && styles.bodyDesktop]}>
        {/* Left / main weather area */}
        <View style={styles.weatherArea}>
          <WeatherBackground condition={condition} />

          <SafeAreaView style={styles.safeArea} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
              <ContextMenuTrigger
                items={[
                  { label: 'Search nearby cities', onPress: openSearch },
                  { label: 'Copy city name', onPress: () => Platform.OS === 'web' && navigator.clipboard?.writeText(weather?.city ?? selectedCity) },
                ]}
                style={styles.cityWrapper}
              >
                {isLoading ? (
                  <View style={styles.cityPlaceholder} />
                ) : (
                  <Text style={styles.cityName} numberOfLines={1}>
                    {weather?.city ?? selectedCity}
                    {weather?.countryCode ? `, ${weather.countryCode}` : ''}
                  </Text>
                )}
              </ContextMenuTrigger>

              {isMobile && (
                <TouchableOpacity onPress={openSearch} hitSlop={12} activeOpacity={0.7}>
                  <SearchIcon />
                </TouchableOpacity>
              )}
            </View>

            {/* Cache badge */}
            {(weather as any)?.fromCache && (
              <View style={styles.cacheBadge}>
                <Text style={styles.cacheBadgeText}>
                  Last updated {(weather as any).cacheAge}
                </Text>
              </View>
            )}

            {/* Hero temperature */}
            {isLoading ? (
              <HeroSkeleton />
            ) : (
              <Animated.View style={[styles.heroContainer, tempAnimStyle]}>
                <Animated.Text style={styles.heroTemp}>
                  {displayTemp ?? '--'}{tempLabel(tempUnit)}
                </Animated.Text>
                <Text style={styles.heroCondition}>{weather?.conditionLabel ?? ''}</Text>
              </Animated.View>
            )}
          </SafeAreaView>

          {/* Mobile: persistent bottom sheet */}
          {isMobile && BottomSheet && BottomSheetScrollView && (
            <BottomSheet
              ref={persistentSheetRef}
              index={0}
              snapPoints={['42%', '85%']}
              backgroundStyle={styles.sheetBackground}
              handleIndicatorStyle={styles.sheetHandle}
              enablePanDownToClose={false}
            >
              <BottomSheetScrollView
                contentContainerStyle={styles.sheetContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.sectionLabel}>Hourly</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hourlyList}
                  data={isLoading ? Array(8).fill(null) : todayHourly}
                  keyExtractor={(item, i) => (item ? item.dt.toString() : `skel-${i}`)}
                  renderItem={({ item, index }) =>
                    isLoading || !item ? (
                      <HourlyCardSkeleton index={index} />
                    ) : (
                      <HourlyCard item={item} index={index} isCurrentHour={item.hour === currentHour} />
                    )
                  }
                  scrollEnabled
                />
                <View style={styles.statsGrid}>
                  {isLoading ? (
                    <><StatsTileSkeleton /><StatsTileSkeleton /><StatsTileSkeleton /><StatsTileSkeleton /></>
                  ) : (
                    <>
                      <StatsTile type="humidity" value={weather?.humidity ?? 0} unit="%" label="Humidity" />
                      <StatsTile type="wind" value={displayWind} unit={` ${windUnit}`} label="Wind" />
                      <StatsTile type="uv" value={weather?.uvIndex ?? 0} unit="" label="UV Index" />
                      <StatsTile type="feelsLike" value={displayFeelsLike} unit={tempLabel(tempUnit)} label="Feels Like" />
                    </>
                  )}
                </View>
                <Text style={styles.sectionLabel}>5-Day Forecast</Text>
                {isLoading
                  ? Array(5).fill(null).map((_, i) => <ForecastRowSkeleton key={i} index={i} />)
                  : forecast.map((day) => (
                      <HoverForecastRow key={day.date} item={day} onDayPress={handleDayPress} />
                    ))}
              </BottomSheetScrollView>
            </BottomSheet>
          )}
        </View>

        {/* Desktop/Tablet: right sidebar */}
        {!isMobile && (
          <WeatherSidebar
            weather={weather}
            forecast={forecast}
            isLoading={isLoading}
            onSelectCity={handleCitySelect}
            onDayPress={handleDayPress}
            searchInputRef={desktopSearchRef}
          />
        )}
      </View>

      {/* Mobile sheets */}
      {isMobile && SearchSheet && (
        <SearchSheet bottomSheetRef={searchSheetRef} onSelectCity={handleCitySelect} />
      )}
      {isMobile && detailSheetRef && (
        <DayDetailSheet bottomSheetRef={detailSheetRef} day={selectedDay} />
      )}

      {/* Desktop day detail panel */}
      {!isMobile && selectedDay && (
        <View style={styles.detailOverlay}>
          <TouchableOpacity style={styles.detailBackdrop} onPress={() => setSelectedDay(null)} activeOpacity={1} />
          <View style={styles.detailPanel}>
            <TouchableOpacity style={styles.detailClose} onPress={() => setSelectedDay(null)}>
              <Text style={styles.detailCloseText}>✕  Close</Text>
            </TouchableOpacity>
            <Text style={styles.detailTitle}>{selectedDay.dayLabel}</Text>
            <Text style={styles.detailSub}>{selectedDay.conditionLabel}</Text>
            {selectedDay.hourly.map((h) => (
              <View key={h.dt} style={styles.detailRow}>
                <Text style={styles.detailHour}>{h.hour}</Text>
                <Text style={styles.detailTemp}>{convertTemp(h.temperature, tempUnit)}{tempLabel(tempUnit)}</Text>
                <Text style={styles.detailRange}>
                  {convertTemp(h.tempMin, tempUnit)}° / {convertTemp(h.tempMax, tempUnit)}°
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Global context menu host */}
      <ContextMenuProvider />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  bodyDesktop: {
    flexDirection: 'row',
  },
  weatherArea: {
    flex: 1,
    position: 'relative',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  cityWrapper: {
    flex: 1,
    marginRight: spacing.md,
  },
  cityName: {
    fontFamily: fonts.sansMedium,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
  },
  cityPlaceholder: {
    width: 120,
    height: 18,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
  },
  cacheBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,155,74,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,155,74,0.3)',
  },
  cacheBadgeText: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    color: colors.accentWarm,
  },
  heroContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  heroTemp: {
    fontFamily: fonts.temperature,
    fontSize: fontSizes.hero,
    color: colors.textPrimary,
    lineHeight: fontSizes.hero * 1.1,
  },
  heroCondition: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  // Mobile bottom sheet
  sheetBackground: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHandle: {
    backgroundColor: colors.textSecondary,
    opacity: 0.4,
  },
  sheetContent: {
    paddingBottom: spacing.xxl,
  },
  sectionLabel: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  hourlyList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  // Desktop detail overlay
  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 500,
    // @ts-ignore
    backdropFilter: 'blur(4px)',
  },
  detailBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  detailPanel: {
    width: 400,
    maxHeight: '80%' as any,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    // @ts-ignore
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
    overflow: 'scroll' as any,
    zIndex: 501,
  },
  detailClose: {
    marginBottom: spacing.md,
  },
  detailCloseText: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  detailTitle: {
    fontFamily: fonts.sansBold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  detailSub: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  detailHour: {
    width: 72,
    fontFamily: fonts.monoRegular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  detailTemp: {
    flex: 1,
    fontFamily: fonts.monoRegular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  detailRange: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
});
