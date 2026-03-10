import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/providers/AuthProvider';
import { generateImage } from '@/services/ai.service';
import { buildAmbientPrompt, AMBIENT_INTERVALS } from '@/services/ambient.service';
import type { AmbientInterval } from '@/services/ambient.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

const DEFAULT_MODEL = 'black-forest-labs/FLUX.1-schnell';
const DEFAULT_INTERVAL: AmbientInterval = 10;

export default function AmbientModeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [nextImage, setNextImage] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [interval, setInterval_] = useState<AmbientInterval>(DEFAULT_INTERVAL);
  const [showControls, setShowControls] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const controlsAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateNext = useCallback(async () => {
    if (!user || generating) return;
    setGenerating(true);

    const prompt = await buildAmbientPrompt(user.id);
    setCurrentPrompt(prompt);

    const { data } = await generateImage({
      prompt,
      model_id: DEFAULT_MODEL,
      provider: 'huggingface',
      width: 1024,
      height: 1024,
    });

    if (data?.image_url) {
      if (!currentImage) {
        setCurrentImage(data.image_url);
      } else {
        setNextImage(data.image_url);
        // Cross-fade
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }).start(() => {
          setCurrentImage(data.image_url);
          setNextImage(null);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }).start();
        });
      }
    }
    setGenerating(false);
  }, [user, generating, currentImage, fadeAnim]);

  const startAmbient = useCallback(() => {
    setIsRunning(true);
    setShowControls(false);
    generateNext();

    // Hide controls after 3s
    Animated.timing(controlsAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
      delay: 3000,
    }).start();
  }, [generateNext, controlsAnim]);

  const stopAmbient = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    Animated.timing(controlsAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setShowControls(true));
  }, []);

  // Schedule next generation
  useEffect(() => {
    if (!isRunning || generating) return;
    const ms = interval * 60 * 1000;
    setCountdown(interval * 60);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    timerRef.current = setTimeout(() => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      generateNext();
    }, ms);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isRunning, generating, interval, generateNext]);

  // Tap to show/hide controls when running
  const handleTap = useCallback(() => {
    if (!isRunning) return;
    Animated.timing(controlsAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      Animated.timing(controlsAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        delay: 3000,
      }).start();
    }, 0);
  }, [isRunning, controlsAnim]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden />
      <Pressable style={styles.fullscreen} onPress={handleTap}>
        {/* Background next image (fades in) */}
        {nextImage && (
          <Image source={{ uri: nextImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
        )}

        {/* Current image with fade */}
        {currentImage && (
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
            <Image source={{ uri: currentImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
          </Animated.View>
        )}

        {/* Dark overlay when no image yet */}
        {!currentImage && (
          <LinearGradient
            colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Generating pulse */}
        {generating && (
          <View style={styles.generatingBadge}>
            <Ionicons name="sparkles" size={14} color="#fff" />
            <Text style={styles.generatingText}>Generating...</Text>
          </View>
        )}

        {/* Controls overlay */}
        <Animated.View style={[styles.controlsOverlay, { opacity: controlsAnim }]}>
          {/* Top bar */}
          <LinearGradient colors={['rgba(0,0,0,0.7)', 'transparent']} style={styles.topGradient}>
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-down" size={28} color="#fff" />
            </Pressable>
            <Text style={styles.titleText}>Ambient Art</Text>
            {isRunning && countdown > 0 && (
              <Text style={styles.countdownText}>Next in {formatCountdown(countdown)}</Text>
            )}
          </LinearGradient>

          {/* Bottom controls */}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.bottomGradient}>
            {/* Prompt display */}
            {currentPrompt ? (
              <Text style={styles.promptDisplay} numberOfLines={2}>{currentPrompt}</Text>
            ) : null}

            {/* Interval selector */}
            {!isRunning && (
              <>
                <Text style={styles.intervalLabel}>Change artwork every</Text>
                <View style={styles.intervalRow}>
                  {AMBIENT_INTERVALS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[styles.intervalChip, interval === opt.value && styles.intervalChipActive]}
                      onPress={() => {
                        if (Platform.OS !== 'web') Haptics.selectionAsync();
                        setInterval_(opt.value);
                      }}
                    >
                      <Text style={[styles.intervalChipText, interval === opt.value && styles.intervalChipTextActive]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {/* Start / Stop */}
            <Pressable
              style={[styles.mainButton, isRunning && styles.mainButtonStop]}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                (isRunning ? stopAmbient : startAmbient)();
              }}
            >
              {isRunning ? (
                <>
                  <Ionicons name="stop" size={20} color="#fff" />
                  <Text style={styles.mainButtonText}>Stop</Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text style={styles.mainButtonText}>Start Ambient Mode</Text>
                </>
              )}
            </Pressable>

            {/* Force generate now */}
            {isRunning && !generating && (
              <Pressable style={styles.nowButton} onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                generateNext();
              }}>
                <Ionicons name="refresh" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.nowButtonText}>Generate now</Text>
              </Pressable>
            )}
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  generatingBadge: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  generatingText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topGradient: {
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    flex: 1,
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
  countdownText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: 'rgba(255,255,255,0.7)',
  },
  bottomGradient: {
    paddingTop: spacing.xxxl,
    paddingBottom: Platform.OS === 'ios' ? 48 : spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  promptDisplay: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.lg,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  intervalLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.sm,
  },
  intervalRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  intervalChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  intervalChipActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  intervalChipText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: 'rgba(255,255,255,0.7)',
  },
  intervalChipTextActive: {
    color: '#000',
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#fff',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  mainButtonStop: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  mainButtonText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: '#000',
  },
  nowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  nowButtonText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: 'rgba(255,255,255,0.7)',
  },
});
