import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Keyboard,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { MotiView } from 'moti';
import { colors, fonts, fontSizes, spacing, radius } from '../../../core/theme';
import { useWeatherStore } from '../store/useWeatherStore';

interface SearchSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  onSelectCity: (city: string) => void;
}

export function SearchSheet({ bottomSheetRef, onSelectCity }: SearchSheetProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);

  const { recentSearches, popularCities } = useWeatherStore();

  const handleSearch = useCallback((text: string) => {
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
  }, [recentSearches, popularCities]);

  const handleSelect = useCallback((city: string) => {
    Keyboard.dismiss();
    setQuery('');
    setResults([]);
    onSelectCity(city);
    bottomSheetRef.current?.close();
  }, [onSelectCity]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.7} />
    ),
    [],
  );

  const listData = query.trim().length >= 2 ? results : [];
  const chips = query.trim().length < 2 ? popularCities : [];

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['85%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handle}
      animateOnMount
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.heading}>Search City</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={handleSearch}
            placeholder="City name..."
            placeholderTextColor={colors.textSecondary}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (query.trim()) handleSelect(query.trim());
            }}
            autoCorrect={false}
            autoCapitalize="words"
          />
        </View>

        {chips.length > 0 && (
          <View>
            <Text style={styles.sectionLabel}>
              {recentSearches.length > 0 ? 'Recent' : 'Popular Cities'}
            </Text>
            <View style={styles.chipsRow}>
              {(recentSearches.length > 0 ? recentSearches.slice(0, 5) : popularCities).map(
                (city, i) => (
                  <MotiView
                    key={city}
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 40, type: 'spring', damping: 18 }}
                  >
                    <TouchableOpacity
                      style={styles.chip}
                      onPress={() => handleSelect(city)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.chipText}>{city}</Text>
                    </TouchableOpacity>
                  </MotiView>
                ),
              )}
            </View>

            {recentSearches.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
                  Popular Cities
                </Text>
                <View style={styles.chipsRow}>
                  {popularCities.map((city, i) => (
                    <MotiView
                      key={city}
                      from={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 40 + 200, type: 'spring', damping: 18 }}
                    >
                      <TouchableOpacity
                        style={styles.chip}
                        onPress={() => handleSelect(city)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.chipText}>{city}</Text>
                      </TouchableOpacity>
                    </MotiView>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {listData.length > 0 && (
          <FlatList
            data={listData}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => (
              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 30, type: 'timing', duration: 200 }}
              >
                <TouchableOpacity
                  style={styles.resultRow}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resultText}>{item}</Text>
                </TouchableOpacity>
              </MotiView>
            )}
          />
        )}
      </BottomSheetView>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  heading: {
    fontFamily: fonts.sansBold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface2,
  },
  input: {
    height: 48,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  sectionLabel: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface2,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  resultRow: {
    height: 52,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultText: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
});
