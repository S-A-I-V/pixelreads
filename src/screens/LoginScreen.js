import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, Animated, ScrollView, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import useAuthStore from '../store/authStore';
import { PixelButton, PixelInput, Toast } from '../components';
import useToast from '../hooks/useToast';
import { colors, fonts, textSizes, spacing, borderWidth } from '../theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PIXEL_HEARTS = ['♥', '♥', '♥', '♥', '♥'];
const NUM_PARTICLES = 25;

// ── Floating Pixel Particles ─────────────────────────────────────
function FloatingParticles() {
  const particles = useRef(
    Array.from({ length: NUM_PARTICLES }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_W,
      y: Math.random() * SCREEN_H,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.5 + 0.2,
      anim: new Animated.Value(0),
      char: ['✦', '✧', '·', '•', '★'][Math.floor(Math.random() * 5)],
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p) => {
      const animate = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(p.anim, {
              toValue: 1,
              duration: 3000 / p.speed,
              useNativeDriver: true,
            }),
            Animated.timing(p.anim, {
              toValue: 0,
              duration: 3000 / p.speed,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };
      setTimeout(animate, Math.random() * 2000);
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <Animated.Text
          key={p.id}
          style={[
            styles.particle,
            {
              left: p.x,
              top: p.y,
              fontSize: p.size * 3,
              opacity: p.anim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [p.opacity * 0.3, p.opacity, p.opacity * 0.3],
              }),
              transform: [
                {
                  translateY: p.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  }),
                },
                {
                  scale: p.anim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 1.2, 0.8],
                  }),
                },
              ],
            },
          ]}
        >
          {p.char}
        </Animated.Text>
      ))}
    </View>
  );
}

// ── Scanline Overlay ─────────────────────────────────────────────
function ScanlineOverlay() {
  const opacity = useRef(new Animated.Value(0.03)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.06, duration: 2000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.03, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const lines = Array.from({ length: Math.ceil(SCREEN_H / 3) }, (_, i) => i);
  
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      {lines.map((i) => (
        <View
          key={i}
          style={{
            height: 1,
            marginTop: 2,
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        />
      ))}
    </Animated.View>
  );
}

// ── Typewriter Text ──────────────────────────────────────────────
function TypewriterText({ text, style, delay = 0, speed = 80 }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let index = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayed(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay, speed]);

  return (
    <Text style={style}>
      {displayed}
      <Text style={{ opacity: displayed.length < text.length ? 1 : 0 }}>▌</Text>
    </Text>
  );
}

// ── Pulsing Glow Logo ────────────────────────────────────────────
function PulsingLogo() {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Continuous glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Subtle float
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.logoWrap,
        {
          transform: [
            { scale: scaleAnim },
            {
              translateY: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -8],
              }),
            },
          ],
        },
      ]}
    >
      {/* Glow effect behind icon */}
      <Animated.View
        style={[
          styles.logoGlow,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.7],
            }),
            transform: [
              {
                scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.3],
                }),
              },
            ],
          },
        ]}
      />
      <Text style={styles.logoIcon}>📖</Text>
      
      <View style={styles.logoTextWrap}>
        <TypewriterText text="PIXEL" style={styles.logoTitle} delay={300} speed={120} />
        <TypewriterText text="READS" style={styles.logoSubtitle} delay={1000} speed={120} />
      </View>

      {/* Animated hearts */}
      <View style={styles.heartRow}>
        {PIXEL_HEARTS.map((h, i) => (
          <HeartBeat key={i} delay={i * 150} />
        ))}
      </View>

      {/* Decorative pixel corners */}
      <View style={[styles.pixelCorner, styles.pixelCornerTL]} />
      <View style={[styles.pixelCorner, styles.pixelCornerTR]} />
      <View style={[styles.pixelCorner, styles.pixelCornerBL]} />
      <View style={[styles.pixelCorner, styles.pixelCornerBR]} />
    </Animated.View>
  );
}

// ── Animated Heart ───────────────────────────────────────────────
function HeartBeat({ delay }) {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.spring(scale, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }).start(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.3, duration: 400, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 400, useNativeDriver: true }),
          ])
        ).start();
      });
    }, 1500 + delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <Animated.Text style={[styles.heart, { transform: [{ scale }] }]}>
      ♥
    </Animated.Text>
  );
}

// ── Main Login Screen ────────────────────────────────────────────
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const buttonGlow = useRef(new Animated.Value(0)).current;
  
  const login = useAuthStore((s) => s.login);
  const { toastMsg, toastVisible, showToast, hideToast } = useToast();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Card entrance animation
    Animated.parallel([
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 800,
        delay: 800,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Button glow loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonGlow, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(buttonGlow, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = () => {
    const ok = login(email);
    if (!ok) {
      shake();
      showToast('ACCESS DENIED ✕');
    }
  };

  return (
    <LinearGradient
      colors={['#0a0012', '#1a0028', '#0d0018', '#0a0012']}
      locations={[0, 0.3, 0.7, 1]}
      style={[styles.gradient, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      {/* Background effects */}
      <FloatingParticles />
      <ScanlineOverlay />

      <Toast message={toastMsg} visible={toastVisible} onHide={hideToast} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Decorative top border */}
          <View style={styles.topBorder}>
            <Text style={styles.borderText}>{'▓'.repeat(20)}</Text>
          </View>

          {/* Animated Logo */}
          <PulsingLogo />

          {/* Login card with entrance animation */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardAnim,
                transform: [
                  { translateX: shakeAnim },
                  { scale: cardScale },
                  {
                    translateY: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Card header decoration */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>{'░▒▓'} LOGIN {'▓▒░'}</Text>
            </View>

            <Text style={styles.cardTitle}>ENTER PLAYER ID</Text>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>{'>'} EMAIL_</Text>
              <PixelInput
                value={email}
                onChangeText={setEmail}
                placeholder="player@game.com"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />
            </View>

            {/* Animated start button */}
            <View style={styles.btnWrap}>
              <Animated.View
                style={[
                  styles.buttonGlow,
                  {
                    opacity: buttonGlow.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.2, 0.5],
                    }),
                  },
                ]}
              />
              <PixelButton
                label="▶ START GAME"
                onPress={handleLogin}
                size="lg"
                style={styles.startBtn}
              />
            </View>

            {/* Retro info box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>{'╔══ PLAYER INFO ══╗'}</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLine}>LVL: 01</Text>
                <Text style={styles.infoLine}>XP: 0/100</Text>
                <Text style={styles.infoLine}>BOOKS: 0</Text>
              </View>
              <Text style={styles.infoTitle}>{'╚════════════════╝'}</Text>
            </View>

            {/* Card footer decoration */}
            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>{'█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█'}</Text>
            </View>
          </Animated.View>

          {/* Bottom decorations */}
          <View style={styles.bottomSection}>
            <Text style={styles.hint}>INSERT COIN TO CONTINUE</Text>
            <View style={styles.coinRow}>
              {[0, 1, 2].map((i) => (
                <BouncingCoin key={i} delay={i * 200} />
              ))}
            </View>
            <Text style={styles.version}>v1.0.0 | 2026</Text>
          </View>

          {/* Decorative bottom border */}
          <View style={styles.bottomBorder}>
            <Text style={styles.borderText}>{'▓'.repeat(20)}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ── Bouncing Coin ────────────────────────────────────────────────
function BouncingCoin({ delay }) {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounce, { toValue: -10, duration: 300, useNativeDriver: true }),
          Animated.timing(bounce, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    }, 2000 + delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <Animated.View style={[styles.coinWrap, { transform: [{ translateY: bounce }] }]}>
      <View style={styles.coin}>
        <Text style={styles.coinText}>$</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },

  // Particles
  particle: {
    position: 'absolute',
    color: colors.pinkHot,
  },

  // Borders
  topBorder: {
    marginBottom: spacing.sm,
  },
  bottomBorder: {
    marginTop: spacing.sm,
  },
  borderText: {
    fontFamily: fonts.pixel,
    fontSize: 8,
    color: colors.pinkDark,
    opacity: 0.5,
    letterSpacing: 2,
  },

  // Logo
  logoWrap: {
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xl,
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.pinkHot,
    top: 10,
  },
  logoIcon: {
    fontSize: 64,
    zIndex: 1,
  },
  logoTextWrap: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  logoTitle: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxl + 4,
    color: colors.pinkHot,
    textShadowColor: colors.pinkDark,
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
    letterSpacing: 8,
  },
  logoSubtitle: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxl + 4,
    color: colors.pinkLight,
    textShadowColor: colors.pinkDark,
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
    letterSpacing: 8,
  },
  heartRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  heart: {
    fontSize: 20,
    color: colors.pinkHot,
    textShadowColor: '#ff0066',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Pixel corners
  pixelCorner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: colors.pinkHot,
    borderWidth: 3,
  },
  pixelCornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  pixelCornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  pixelCornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  pixelCornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  // Card
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(26, 0, 40, 0.9)',
    borderWidth: borderWidth.thick,
    borderColor: colors.pinkHot,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.pinkHot,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardHeaderText: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xs,
    color: colors.pinkHot,
    letterSpacing: 2,
  },
  cardTitle: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.textDim,
    letterSpacing: 1,
    textAlign: 'center',
  },
  inputWrap: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.green,
    letterSpacing: 1,
  },
  btnWrap: {
    alignItems: 'center',
    position: 'relative',
    marginTop: spacing.sm,
  },
  buttonGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.pinkHot,
    borderRadius: 4,
  },
  startBtn: {
    alignSelf: 'stretch',
  },
  cardFooter: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  footerText: {
    fontFamily: fonts.pixel,
    fontSize: 8,
    color: colors.pinkDark,
    opacity: 0.6,
  },

  // Info box
  infoBox: {
    padding: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: colors.pinkDark,
  },
  infoTitle: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs - 2,
    color: colors.pinkDark,
    letterSpacing: 0,
  },
  infoContent: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoLine: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs - 2,
    color: colors.textMuted,
  },

  // Bottom
  bottomSection: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  hint: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.textMuted,
    opacity: 0.7,
    letterSpacing: 2,
  },
  coinRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  coinWrap: {},
  coin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD700',
    borderWidth: 3,
    borderColor: '#DAA520',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  coinText: {
    fontFamily: fonts.pixel,
    fontSize: 14,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  version: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs - 2,
    color: colors.textMuted,
    opacity: 0.4,
  },
});
