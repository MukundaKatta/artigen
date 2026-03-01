import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useStickerPacks } from '@/hooks/useStickerPacks';
import { StickerPackCard } from '@/components/stickers/StickerPackCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Tab = 'browse' | 'mine' | 'saved';

export default function StickerPacksScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { packs, savedPacks, myPacks, loading, savePack, unsavePack } = useStickerPacks(user?.id);
  const [activeTab, setActiveTab] = useState<Tab>('browse');

  const savedPackIds = new Set(savedPacks.map((p) => p.id));

  const tabs: { key: Tab; label: string }[] = [
    { key: 'browse', label: 'Browse' },
    { key: 'mine', label: 'My Packs' },
    { key: 'saved', label: 'Saved' },
  ];

  const getActiveData = () => {
    switch (activeTab) {
      case 'browse': return packs;
      case 'mine': return myPacks;
      case 'saved': return savedPacks;
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Sticker Packs',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(screens)/sticker-pack/create')}
              style={styles.headerButton}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={getActiveData()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StickerPackCard
            pack={item}
            isSaved={savedPackIds.has(item.id)}
            onPress={() => router.push(`/(screens)/sticker-pack/${item.id}`)}
            onSave={() => {
              if (savedPackIds.has(item.id)) {
                unsavePack(item.id);
              } else {
                savePack(item.id);
              }
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="happy-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              {activeTab === 'browse'
                ? 'No sticker packs available yet'
                : activeTab === 'mine'
                ? 'You haven\'t created any packs yet'
                : 'No saved packs'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerButton: { paddingHorizontal: spacing.sm },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontFamily: typography.semiBold,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
