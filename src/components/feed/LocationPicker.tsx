import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { Location } from '@/types';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: Location) => void;
};

export function LocationPicker({ visible, onClose, onSelect }: Props) {
  const { results, searching, search, clear } = useLocationSearch();
  const [query, setQuery] = useState('');

  function handleSearch(text: string) {
    setQuery(text);
    search(text);
  }

  function handleSelect(location: Location) {
    onSelect(location);
    setQuery('');
    clear();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Location</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Search locations..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
        </View>

        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
              <View style={styles.rowInfo}>
                <Text style={styles.name}>{item.name}</Text>
                {item.address && (
                  <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
                )}
              </View>
              {item.post_count > 0 && (
                <Text style={styles.count}>{item.post_count} posts</Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            query.length > 0 && !searching ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No locations found</Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => handleSelect({ id: '', name: query, address: null, lat: null, lng: null, post_count: 0, created_at: '' })}
                >
                  <Text style={styles.createText}>Use "{query}"</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  rowInfo: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  address: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  count: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  createButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  createText: {
    color: colors.textLight,
    fontFamily: typography.semiBold,
    fontWeight: '600',
  },
});
