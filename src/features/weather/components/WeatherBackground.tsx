import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { Condition } from '../types';

function webGradient(condition: Condition): string {
  switch (condition) {
    case 'clear':
      return 'linear-gradient(180deg, #080C14 0%, #0D1A2E 60%, #1A2B4A 100%)';
    case 'thunderstorm':
      return 'linear-gradient(180deg, #080C14 0%, #0E0A1E 60%, #1A1030 100%)';
    case 'rain':
    case 'drizzle':
      return 'linear-gradient(180deg, #080C14 0%, #0A121E 60%, #111C2E 100%)';
    default:
      return 'linear-gradient(180deg, #080C14 0%, #0F1624 100%)';
  }
}

interface WeatherBackgroundProps {
  condition: Condition;
}

export function WeatherBackground({ condition }: WeatherBackgroundProps) {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        // @ts-ignore — backgroundImage is valid CSS on web
        { backgroundImage: webGradient(condition) },
      ]}
    />
  );
}
