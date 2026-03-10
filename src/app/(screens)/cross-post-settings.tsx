import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCrossPost } from '@/hooks/useCrossPost';
import { PlatformIcon, getPlatformLabel } from '@/components/cross-post/PlatformIcon';
import { SUPPORTED_PLATFORMS } from '@/services/cross-post.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

export default function CrossPostSettingsRoute() {
  const { user } = useAuth();
  const { accounts, loading, connect, disconnect } = useCrossPost(user?.id);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');

  function handleConnectPress(platform: string) {
    setConnectingPlatform(platform);
    setUsernameInput('');
  }

  async function handleConfirmConnect() {
    if (!connectingPlatform || !usernameInput.trim()) return;
    await connect(connectingPlatform, usernameInput.trim());
    setConnectingPlatform(null);
    setUsernameInput('');
  }

  function handleDisconnect(accountId: string, platform: string) {
    Alert.alert(
      'Disconnect Account',
      `Disconnect your ${getPlatformLabel(platform)} account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => disconnect(accountId),
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Cross-Post Settings' }} />
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Cross-Post Settings' }} />

      <Text style={styles.headerText}>
        Connect your social media accounts to cross-post your art across platforms.
      </Text>

      {SUPPORTED_PLATFORMS.map((platform) => {
        const account = accounts.find((a) => a.platform === platform);
        const isConnected = account?.is_connected;

        return (
          <View key={platform} style={styles.platformRow}>
            <PlatformIcon platform={platform} size={28} />
            <View style={styles.platformInfo}>
              <Text style={styles.platformName}>{getPlatformLabel(platform)}</Text>
              {isConnected && account?.platform_username ? (
                <Text style={styles.username}>@{account.platform_username}</Text>
              ) : (
                <Text style={styles.notConnected}>Not connected</Text>
              )}
            </View>
            {isConnected ? (
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={() => handleDisconnect(account!.id, platform)}
              >
                <Ionicons name="close-circle-outline" size={20} color={colors.error} />
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.connectButton}
                onPress={() => handleConnectPress(platform)}
              >
                <Text style={styles.connectText}>Connect</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      {/* Connect Dialog */}
      {connectingPlatform && (
        <View style={styles.connectDialog}>
          <Text style={styles.connectDialogTitle}>
            Connect {getPlatformLabel(connectingPlatform)}
          </Text>
          <Text style={styles.connectDialogSubtitle}>
            Enter your username to connect your account. In production, this would use OAuth.
          </Text>
          <TextInput
            style={styles.input}
            placeholder={`Your ${getPlatformLabel(connectingPlatform)} username`}
            placeholderTextColor={colors.textSecondary}
            value={usernameInput}
            onChangeText={setUsernameInput}
            autoCapitalize="none"
            autoFocus
          />
          <View style={styles.dialogButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setConnectingPlatform(null)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, !usernameInput.trim() && { opacity: 0.5 }]}
              onPress={handleConfirmConnect}
              disabled={!usernameInput.trim()}
            >
              <Text style={styles.confirmText}>Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  headerText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  username: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  notConnected: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  connectButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  connectText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  disconnectText: {
    color: colors.error,
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
  },
  connectDialog: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  connectDialogTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  connectDialogSubtitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  confirmButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: '#FFFFFF',
  },
});
