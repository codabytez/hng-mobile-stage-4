import React from 'react';
import Svg, { Path, Circle, G, Line, Polyline } from 'react-native-svg';
import type { Condition } from '../types';
import { colors } from '../../../core/theme';

interface Props {
  condition: Condition;
  size?: number;
  color?: string;
}

export function ConditionIcon({ condition, size = 24, color }: Props) {
  const stroke = color ?? colors.textSecondary;
  const props = { width: size, height: size, viewBox: '0 0 24 24' };

  switch (condition) {
    case 'clear':
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="4" stroke={colors.accentWarm} strokeWidth="2" fill="none" />
          <Line x1="12" y1="2" x2="12" y2="4" stroke={colors.accentWarm} strokeWidth="2" strokeLinecap="round" />
          <Line x1="12" y1="20" x2="12" y2="22" stroke={colors.accentWarm} strokeWidth="2" strokeLinecap="round" />
          <Line x1="2" y1="12" x2="4" y2="12" stroke={colors.accentWarm} strokeWidth="2" strokeLinecap="round" />
          <Line x1="20" y1="12" x2="22" y2="12" stroke={colors.accentWarm} strokeWidth="2" strokeLinecap="round" />
          <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={colors.accentWarm} strokeWidth="2" strokeLinecap="round" />
          <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={colors.accentWarm} strokeWidth="2" strokeLinecap="round" />
          <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={colors.accentWarm} strokeWidth="2" strokeLinecap="round" />
          <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={colors.accentWarm} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );

    case 'clouds':
      return (
        <Svg {...props}>
          <Path
            d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
            stroke={stroke}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'rain':
    case 'drizzle':
      return (
        <Svg {...props}>
          <Path
            d="M16 13v8M8 13v8M12 15v8"
            stroke={colors.accentCold}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M18 10h-1.26A8 8 0 1 0 9 16h9a5 5 0 0 0 0-6z"
            stroke={stroke}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'thunderstorm':
      return (
        <Svg {...props}>
          <Path
            d="M18 10h-1.26A8 8 0 1 0 9 16h9a5 5 0 0 0 0-6z"
            stroke={colors.accentStorm}
            strokeWidth="2"
            fill="none"
          />
          <Polyline
            points="13,11 11,17 14,17 12,23"
            stroke="#FFD700"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'snow':
      return (
        <Svg {...props}>
          <Path
            d="M18 10h-1.26A8 8 0 1 0 9 16h9a5 5 0 0 0 0-6z"
            stroke={stroke}
            strokeWidth="2"
            fill="none"
          />
          <Line x1="12" y1="18" x2="12" y2="22" stroke="#A8D8FF" strokeWidth="2" strokeLinecap="round" />
          <Line x1="10" y1="20" x2="14" y2="20" stroke="#A8D8FF" strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );

    case 'mist':
      return (
        <Svg {...props}>
          <Line x1="3" y1="10" x2="21" y2="10" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <Line x1="3" y1="14" x2="21" y2="14" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <Line x1="5" y1="18" x2="19" y2="18" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <Line x1="5" y1="6" x2="19" y2="6" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );

    default:
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="2" fill="none" />
          <Path d="M12 8v4M12 16h.01" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );
  }
}
