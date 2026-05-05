import React, { useMemo } from 'react';
import { Platform, View, StyleSheet, useWindowDimensions } from 'react-native';
import type { Condition } from '../types';
import { colors } from '../../../core/theme';

// Web gets a simple CSS gradient — Skia CanvasKit not loaded in Expo web by default
if (Platform.OS !== 'web') {
  // Skia imports only evaluated on native
}

let Canvas: any, Circle: any, Paint: any, useLoop: any, useDerivedValue: any,
    vec: any, LinearGradient: any, Rect: any, Line: any;

if (Platform.OS !== 'web') {
  const Skia = require('@shopify/react-native-skia');
  Canvas = Skia.Canvas;
  Circle = Skia.Circle;
  Paint = Skia.Paint;
  useLoop = Skia.useLoop;
  useDerivedValue = Skia.useDerivedValue;
  vec = Skia.vec;
  LinearGradient = Skia.LinearGradient;
  Rect = Skia.Rect;
  Line = Skia.Line;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  phase: number;
  opacity: number;
}

function useParticles(count: number, width: number, height: number): Particle[] {
  return useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.4 + 0.1,
      phase: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.4 + 0.1,
    }));
  }, [count, width, height]);
}

interface WeatherBackgroundProps {
  condition: Condition;
}

function webGradient(condition: Condition): string {
  switch (condition) {
    case 'clear': return 'linear-gradient(180deg, #080C14 0%, #0D1A2E 60%, #1A2B4A 100%)';
    case 'thunderstorm': return 'linear-gradient(180deg, #080C14 0%, #0E0A1E 60%, #1A1030 100%)';
    case 'rain': case 'drizzle': return 'linear-gradient(180deg, #080C14 0%, #0A121E 60%, #111C2E 100%)';
    default: return 'linear-gradient(180deg, #080C14 0%, #0F1624 100%)';
  }
}

export function WeatherBackground({ condition }: WeatherBackgroundProps) {
  const { width, height } = useWindowDimensions();

  if (Platform.OS === 'web') {
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

  return <NativeWeatherBackground condition={condition} width={width} height={height} />;
}

function NativeWeatherBackground({ condition, width, height }: WeatherBackgroundProps & { width: number; height: number }) {
  const loop = useLoop({ duration: 4000 });

  const particles = useParticles(40, width, height);
  const rainDrops = useParticles(60, width, height);

  const gradientColors = useDerivedValue(() => {
    switch (condition) {
      case 'clear':
        return ['#080C14', '#0D1A2E', '#1A2B4A'];
      case 'thunderstorm':
        return ['#080C14', '#0E0A1E', '#1A1030'];
      case 'rain':
      case 'drizzle':
        return ['#080C14', '#0A121E', '#111C2E'];
      case 'snow':
        return ['#080C14', '#0E1520', '#161E2E'];
      default:
        return ['#080C14', '#0F1624', '#0A1020'];
    }
  }, [condition]);

  const progress = useDerivedValue(() => loop.current.value, [loop]);

  return (
    <Canvas style={{ position: 'absolute', top: 0, left: 0, width, height }}>
      {/* Background gradient */}
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(width / 2, 0)}
          end={vec(width / 2, height)}
          colors={['#080C14', '#0F1624']}
        />
      </Rect>

      {condition === 'thunderstorm' && (
        <StormParticles
          particles={particles}
          progress={progress}
          width={width}
          height={height}
        />
      )}

      {(condition === 'rain' || condition === 'drizzle') && (
        <RainStreaks
          drops={rainDrops}
          progress={progress}
          width={width}
          height={height}
        />
      )}

      {condition === 'clear' && (
        <ShimmerDots
          particles={particles}
          progress={progress}
        />
      )}

      {condition === 'clouds' && (
        <CloudBlobs
          particles={particles}
          progress={progress}
          width={width}
          height={height}
        />
      )}

      {(condition === 'mist' || condition === 'snow' || condition === 'unknown') && (
        <ShimmerDots
          particles={particles}
          progress={progress}
        />
      )}
    </Canvas>
  );
}

function ShimmerDots({ particles, progress }: { particles: Particle[]; progress: any }) {
  return (
    <>
      {particles.map((p, i) => {
        const opacity = useDerivedValue(() => {
          const wave = Math.sin(progress.value * Math.PI * 2 + p.phase);
          return p.opacity * (0.5 + wave * 0.5);
        }, [progress]);

        const cy = useDerivedValue(() => {
          return p.y + Math.sin(progress.value * Math.PI * 2 + p.phase) * 8;
        }, [progress]);

        return (
          <Circle key={i} cx={p.x} cy={cy} r={p.radius}>
            <Paint color="#FF9B4A" opacity={opacity} />
          </Circle>
        );
      })}
    </>
  );
}

function CloudBlobs({ particles, progress, width, height }: { particles: Particle[]; progress: any; width: number; height: number }) {
  return (
    <>
      {particles.slice(0, 20).map((p, i) => {
        const cx = useDerivedValue(() => {
          const drift = (progress.value * p.speed * width * 0.3 + p.x) % (width + 40);
          return drift;
        }, [progress]);

        const opacity = useDerivedValue(() => p.opacity * 0.6, []);

        return (
          <Circle key={i} cx={cx} cy={p.y} r={p.radius * 8}>
            <Paint color="rgba(255,255,255,0.04)" opacity={opacity} />
          </Circle>
        );
      })}
    </>
  );
}

function RainStreaks({ drops, progress, width, height }: { drops: Particle[]; progress: any; width: number; height: number }) {
  return (
    <>
      {drops.map((drop, i) => {
        const y1 = useDerivedValue(() => {
          return (drop.y + progress.value * height * drop.speed * 2) % (height + 20);
        }, [progress]);

        const y2 = useDerivedValue(() => y1.value + 12, [y1]);

        return (
          <Line
            key={i}
            p1={useDerivedValue(() => vec(drop.x, y1.value), [y1])}
            p2={useDerivedValue(() => vec(drop.x + 1, y2.value), [y2])}
            color="rgba(74,158,255,0.25)"
            strokeWidth={1}
          />
        );
      })}
    </>
  );
}

function StormParticles({ particles, progress, width, height }: { particles: Particle[]; progress: any; width: number; height: number }) {
  return (
    <>
      {particles.map((p, i) => {
        const cx = useDerivedValue(() => {
          return (p.x + progress.value * width * p.speed * 1.5) % (width + 20);
        }, [progress]);

        const cy = useDerivedValue(() => {
          return (p.y + progress.value * height * p.speed * 0.8) % (height + 20);
        }, [progress]);

        const opacity = useDerivedValue(() => {
          const flicker = Math.sin(progress.value * Math.PI * 6 + p.phase);
          return p.opacity * (0.3 + Math.abs(flicker) * 0.7);
        }, [progress]);

        return (
          <Circle key={i} cx={cx} cy={cy} r={p.radius * 1.5}>
            <Paint color="#7B5EA7" opacity={opacity} />
          </Circle>
        );
      })}
    </>
  );
}
