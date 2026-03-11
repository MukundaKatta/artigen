import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, spacing, fontSize, borderRadius, typography } from '@/lib/theme';
import { logger } from '@/lib/logger';
import { trackEvent, TELEMETRY_EVENTS } from '@/lib/telemetry';

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

/**
 * React Error Boundary that catches rendering errors and displays
 * a recovery UI instead of crashing the entire app.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(
      '[ErrorBoundary] Caught error:',
      error.message,
      '\nComponent stack:',
      errorInfo.componentStack,
    );

    // Report to telemetry for production monitoring
    trackEvent(TELEMETRY_EVENTS.error_boundary_triggered, {
      error_name: error.name,
      error_message: error.message.slice(0, 500),
      component_stack: errorInfo.componentStack?.slice(0, 500) ?? '',
    });

    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null }, () => {
      try {
        router.replace('/(tabs)');
      } catch {
        // Navigation may not be ready; retry is still available
      }
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <Ionicons name="warning-outline" size={36} color={colors.error} />
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {__DEV__ ? this.state.error?.message : 'An unexpected error occurred. Please try again.'}
          </Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={styles.button}
              onPress={this.handleRetry}
              accessibilityRole="button"
              accessibilityLabel="Try again"
            >
              <Ionicons name="refresh" size={18} color={colors.textLight} />
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={this.handleGoHome}
              accessibilityRole="button"
              accessibilityLabel="Go to home screen"
            >
              <Ionicons name="home-outline" size={18} color={colors.primary} />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Go Home</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.background,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 44,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
});
