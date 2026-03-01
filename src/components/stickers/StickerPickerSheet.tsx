import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { SCREEN_WIDTH } from '@/lib/constants';
import * as stickerPackService from '@/services/sticker-pack.service';

const COLS = 4;
const GAP = spacing.sm;
const STICKER_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - GAP * (COLS - 1)) / COLS;

type Sticker = {
  id: string;
  image_url: string;
  label?: string | null;
};

type Pack = {
  id: string;
  name: string;
  cover_url?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (sticker: Sticker) => void;
  userId?: string;
};

export function StickerPickerSheet({ visible, onClose, onSelect, userId }: Props) {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);

  useEffect(() => {
    if (visible && userId) {
      stickerPackService.getSavedPacks(userId).then(({ data }) => {
        const packList = (data || []).map((d: any) => d.pack || d);
        setPacks(packList);
        if (packList.length > 0 && !selectedPack) {
          setSelectedPack(packList[0].id);
        }
      });
    }
  }, [visible, userId]);

  useEffect(() => {
    if (selectedPack) {
      stickerPackService.getPackStickers(selectedPack).then(({ data }) => {
        setStickers(data || []);
      });
    }
  }, [selectedPack]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Stickers</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Pack tabs */}
          <FlatList
            data={packs}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            style={styles.packTabs}
            contentContainerStyle={styles.packTabsContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedPack(item.id)}
                style={[styles.packTab, selectedPack === item.id && styles.packTabActive]}
              >
                {item.cover_url ? (
                  <Image source={{ uri: item.cover_url }} style={styles.packTabImage} contentFit="cover" />
                ) : (
                  <View style={styles.packTabPlaceholder}>
                    <Ionicons name="happy-outline" size={16} color={colors.textSecondary} />
                  </View>
                )}
              </TouchableOpacity>
            )}
          />

          {/* Sticker grid */}
          <FlatList
            data={stickers}
            numColumns={COLS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.stickerGrid}
            columnWrapperStyle={styles.stickerRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => { onSelect(item); onClose(); }}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.stickerImage}
                  contentFit="contain"
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {packs.length === 0 ? 'Save some sticker packs to use them here' : 'No stickers in this pack'}
              </Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  packTabs: {
    maxHeight: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  packTabsContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  packTab: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  packTabActive: {
    borderColor: colors.primary,
  },
  packTabImage: {
    width: 32,
    height: 32,
  },
  packTabPlaceholder: {
    width: 32,
    height: 32,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerGrid: {
    padding: spacing.lg,
  },
  stickerRow: {
    gap: GAP,
    marginBottom: GAP,
  },
  stickerImage: {
    width: STICKER_SIZE,
    height: STICKER_SIZE,
    borderRadius: borderRadius.md,
  },
  empty: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.xl,
  },
});
