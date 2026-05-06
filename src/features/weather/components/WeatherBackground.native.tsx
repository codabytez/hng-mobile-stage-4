import React, { useMemo, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  Canvas,
  Circle,
  Paint,
  LinearGradient,
  Rect,
  Line,
  vec,
} from '@shopify/react-native-skia';
import type { Condition } from '../types';

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

export function WeatherBackground({ condition }: WeatherBackgroundProps) {
  const { width, height } = useWindowDimensions();
  return <NativeWeatherBackground condition={condition} width={width} height={height} />;
}

function NativeWeatherBackground({
  condition,
  width,
  height,
}: WeatherBackgroundProps & { width: number; height: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const particles = useParticles(40, width, height);
  const rainDrops = useParticles(60, width, height);

  return (
    <Canvas style={{ position: 'absolute', top: 0, left: 0, width, height }}>
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(width / 2, 0)}
          end={vec(width / 2, height)}
          colors={['#080C14', '#0F1624']}
        />
      </Rect>

      {condition === 'thunderstorm' && (
        <StormParticles particles={particles} progress={progress} width={width} height={height} />
      )}
      {(condition === 'rain' || condition === 'drizzle') && (
        <RainStreaks drops={rainDrops} progress={progress} width={width} height={height} />
      )}
      {(condition === 'clear' || condition === 'mist' || condition === 'snow' || condition === 'unknown') && (
        <ShimmerDots particles={particles} progress={progress} />
      )}
      {condition === 'clouds' && (
        <CloudBlobs particles={particles} progress={progress} width={width} height={height} />
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
        });
        const cy = useDerivedValue(() => {
          return p.y + Math.sin(progress.value * Math.PI * 2 + p.phase) * 8;
        });
        return (
          <Circle key={i} cx={p.x} cy={cy} r={p.radius}>
            <Paint color="#FF9B4A" opacity={opacity} />
          </Circle>
        );
      })}
    </>
  );
}

function CloudBlobs({
  particles,
  progress,
  width,
}: {
  particles: Particle[];
  progress: any;
  width: number;
  height: number;
}) {
  return (
    <>
      {particles.slice(0, 20).map((p, i) => {
        const cx = useDerivedValue(() => {
          return (progress.value * p.speed * width * 0.3 + p.x) % (width + 40);
        });
        const opacity = useDerivedValue(() => p.opacity * 0.6);
        return (
          <Circle key={i} cx={cx} cy={p.y} r={p.radius * 8}>
            <Paint color="rgba(255,255,255,0.04)" opacity={opacity} />
          </Circle>
        );
      })}
    </>
  );
}

function RainStreaks({
  drops,
  progress,
  height,
}: {
  drops: Particle[];
  progress: any;
  width: number;
  height: number;
}) {
  return (
    <>
      {drops.map((drop, i) => {
        const y1 = useDerivedValue(() => {
          return (drop.y + progress.value * height * drop.speed * 2) % (height + 20);
        });
        const y2 = useDerivedValue(() => y1.value + 12);
        const p1 = useDerivedValue(() => vec(drop.x, y1.value));
        const p2 = useDerivedValue(() => vec(drop.x + 1, y2.value));
        return (
          <Line key={i} p1={p1} p2={p2} color="rgba(74,158,255,0.25)" strokeWidth={1} />
        );
      })}
    </>
  );
}

function StormParticles({
  particles,
  progress,
  width,
  height,
}: {
  particles: Particle[];
  progress: any;
  width: number;
  height: number;
}) {
  return (
    <>
      {particles.map((p, i) => {
        const cx = useDerivedValue(() => {
          return (p.x + progress.value * width * p.speed * 1.5) % (width + 20);
        });
        const cy = useDerivedValue(() => {
          return (p.y + progress.value * height * p.speed * 0.8) % (height + 20);
        });
        const opacity = useDerivedValue(() => {
          const flicker = Math.sin(progress.value * Math.PI * 6 + p.phase);
          return p.opacity * (0.3 + Math.abs(flicker) * 0.7);
        });
        return (
          <Circle key={i} cx={cx} cy={cy} r={p.radius * 1.5}>
            <Paint color="#7B5EA7" opacity={opacity} />
          </Circle>
        );
      })}
    </>
  );
}
