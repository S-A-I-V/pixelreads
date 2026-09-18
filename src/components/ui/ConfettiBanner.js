import React, { useEffect, useState, useCallback } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { homeColors } from '../../theme';

const CONFETTI_COLORS = [
  '#FBCA1F', '#F15BB5', '#60A5FA', '#10B981', '#A78BFA',
  '#FB923C', '#E879F9', '#2DD4BF', '#FFFFFF',
];

const PARTICLE_COUNT = 100;
const DURATION = 2200;

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function ConfettiParticle({ containerWidth, containerHeight, fromLeft, delay }) {
  const color = pickRandom(CONFETTI_COLORS);
  const size = randomRange(5, 10);
  const isRect = Math.random() > 0.5;
  const w = isRect ? size * 1.6 : size;
  const h = isRect ? size * 0.7 : size;

  const inset = containerWidth * 0.2;
  const startX = fromLeft
    ? randomRange(inset * 0.5, inset)
    : randomRange(containerWidth - inset, containerWidth - inset * 0.5);
  const startY = containerHeight * randomRange(0.4, 0.7);

  const angle = fromLeft
    ? randomRange(-Math.PI / 3, -Math.PI / 7)
    : randomRange(-Math.PI * 6 / 7, -Math.PI * 2 / 3);
  const velocity = randomRange(200, 420);

  const endX = startX + Math.cos(angle) * velocity + randomRange(-60, 60);
  const peakY = startY + Math.sin(angle) * velocity;
  const endY = containerHeight + 80;

  const translateX = useSharedValue(startX);
  const translateY = useSharedValue(startY);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scaleY = useSharedValue(1);

  useEffect(() => {
    const dur = DURATION + randomRange(-300, 300);
    const riseDur = dur * 0.4;
    const fallDur = dur * 0.6;
    const fadeInDelay = delay + randomRange(30, 80);

    opacity.value = withDelay(fadeInDelay, withTiming(1, { duration: 80 }));

    translateX.value = withDelay(delay, withTiming(endX, { duration: dur, easing: Easing.out(Easing.quad) }));

    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(peakY, { duration: riseDur, easing: Easing.out(Easing.cubic) }),
        withTiming(endY, { duration: fallDur, easing: Easing.in(Easing.quad) })
      )
    );

    rotate.value = withDelay(delay, withTiming(randomRange(4, 12) * Math.PI, { duration: dur }));
    scaleY.value = withDelay(delay, withTiming(0, { duration: dur }));

    const fadeOutStart = delay + dur * 0.9;
    opacity.value = withDelay(
      fadeInDelay,
      withSequence(
        withTiming(1, { duration: 20 }),
        withDelay(fadeOutStart - fadeInDelay - 20, withTiming(0, { duration: dur * 0.1 }))
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}rad` },
      { scaleY: Math.abs(Math.cos(scaleY.value * Math.PI * 3)) * 0.8 + 0.2 },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        { width: w, height: h, backgroundColor: color },
        animStyle,
      ]}
    />
  );
}

function ConfettiOverlay({ layout, wave }) {
  if (!layout) return null;

  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => (
    <ConfettiParticle
      key={`${wave}-${i}`}
      containerWidth={layout.width}
      containerHeight={layout.height}
      fromLeft={i % 2 === 0}
      delay={randomRange(0, 400)}
    />
  ));

  return (
    <View
      style={[styles.particleLayer, { top: layout.y, left: layout.x, width: layout.width, height: layout.height }]}
      pointerEvents="none"
    >
      {particles}
    </View>
  );
}

export function ConfettiBanner() {
  const [layout, setLayout] = useState(null);
  const [wave, setWave] = useState(0);

  const onLayout = useCallback((e) => {
    e.target.measureInWindow((x, y, width, height) => {
      setLayout({ x: 0, y: 0, width, height });
    });
  }, []);

  useEffect(() => {
    if (!layout) return;
    const interval = setInterval(() => {
      setWave((w) => w + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [layout]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.banner} onLayout={onLayout}>
        <Image
          source={require('../../../assets/images/categories/book-completion.png')}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </View>
      <ConfettiOverlay layout={layout} wave={wave} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 10,
  },
  banner: {
    height: 150,
    borderWidth: 3,
    borderColor: '#000000',
    borderRightWidth: 5,
    borderBottomWidth: 5,
    overflow: 'hidden',
    zIndex: 1,
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  particleLayer: {
    position: 'absolute',
    zIndex: 20,
    overflow: 'visible',
  },
  particle: {
    position: 'absolute',
    borderRadius: 1,
  },
});
