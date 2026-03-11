import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { showAlert } from '@/utils/alert';
import { useAuth } from '@/providers/AuthProvider';
import { registerSchema, RegisterFormData } from '@/utils/validation';
import { colors, fontSize, spacing, typography } from '@/lib/theme';
import { LogoText } from '@/components/ui/LogoText';

function useFadeIn(delay: number) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }));
  }, [delay, opacity, translateY]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

export function RegisterScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logoStyle = useFadeIn(0);
  const formStyle = useFadeIn(200);
  const footerStyle = useFadeIn(400);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', username: '', fullName: '', password: '' },
  });

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);
    const { error } = await signUp(data.email, data.password, data.username, data.fullName);
    setLoading(false);

    if (error) {
      showAlert('Sign Up Failed', error.message);
    } else {
      // Navigate to onboarding to set up taste profile
      router.replace('/(auth)/onboarding');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <LogoText size="lg" />
        </Animated.View>
        <Animated.View style={logoStyle}>
          <Text style={styles.subtitle}>
            Create, share, and discover AI-generated art.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.form, formStyle]}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Email"
                keyboardType="email-address"
                autoComplete="email"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Full Name"
                autoComplete="name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.fullName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Username"
                autoComplete="username"
                onBlur={onBlur}
                onChangeText={(text) => onChange(text.toLowerCase())}
                value={value}
                error={errors.username?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Password"
                secureTextEntry
                autoComplete="new-password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.password?.message}
              />
            )}
          />

          <Button
            title="Sign Up"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            size="lg"
            style={styles.signupButton}
          />
        </Animated.View>

        <Animated.View style={[styles.loginRow, footerStyle]}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Button
            title="Log In"
            variant="text"
            onPress={() => router.back()}
            size="sm"
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  form: {
    gap: spacing.xs,
  },
  signupButton: {
    marginTop: spacing.sm,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxxl,
  },
  loginText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
});
