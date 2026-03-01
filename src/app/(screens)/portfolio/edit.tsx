import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioSection } from '@/components/portfolio/PortfolioSection';
import { PortfolioToggle } from '@/components/portfolio/PortfolioToggle';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

export default function PortfolioEditRoute() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const {
    sections,
    loading,
    portfolioEnabled,
    setPortfolioEnabled,
    createSection,
    deleteSection,
    removeItem,
    enablePortfolio,
    disablePortfolio,
    refresh,
  } = usePortfolio(user?.id);

  const [bio, setBio] = useState((profile as any)?.portfolio_bio || '');
  const [contactEmail, setContactEmail] = useState(
    (profile as any)?.portfolio_contact_email || ''
  );
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPortfolioEnabled((profile as any)?.portfolio_enabled || false);
  }, [profile, setPortfolioEnabled]);

  async function handleTogglePortfolio(enabled: boolean) {
    if (enabled) {
      await enablePortfolio(bio, contactEmail);
    } else {
      await disablePortfolio();
    }
    await refreshProfile();
  }

  async function handleAddSection() {
    const title = newSectionTitle.trim();
    if (!title) return;
    await createSection(title);
    setNewSectionTitle('');
  }

  async function handleDeleteSection(sectionId: string) {
    Alert.alert('Delete Section', 'This will remove the section and all its items.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteSection(sectionId);
        },
      },
    ]);
  }

  async function handleRemoveItem(sectionId: string, itemId: string) {
    await removeItem(sectionId, itemId);
  }

  async function handleSave() {
    if (!user?.id) return;
    setSaving(true);
    if (portfolioEnabled) {
      await enablePortfolio(bio.trim(), contactEmail.trim());
    }
    await refreshProfile();
    setSaving(false);
    router.back();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Edit Portfolio' }} />

      <PortfolioToggle
        enabled={portfolioEnabled}
        onToggle={handleTogglePortfolio}
      />

      {/* Bio */}
      <Text style={styles.sectionTitle}>Portfolio Bio</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Tell visitors about your art and creative process..."
        placeholderTextColor={colors.textSecondary}
        value={bio}
        onChangeText={setBio}
        multiline
      />

      {/* Contact Email */}
      <Text style={styles.sectionTitle}>Contact Email</Text>
      <TextInput
        style={styles.input}
        placeholder="your@email.com"
        placeholderTextColor={colors.textSecondary}
        value={contactEmail}
        onChangeText={setContactEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Add Section */}
      <Text style={styles.sectionTitle}>Sections</Text>
      <View style={styles.addSectionRow}>
        <TextInput
          style={[styles.input, styles.addSectionInput]}
          placeholder="New section title..."
          placeholderTextColor={colors.textSecondary}
          value={newSectionTitle}
          onChangeText={setNewSectionTitle}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddSection}
          disabled={!newSectionTitle.trim()}
        >
          <Ionicons name="add-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Sections List */}
      {sections.map((section) => (
        <View key={section.id} style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <Text style={styles.sectionCardTitle}>{section.title}</Text>
            <TouchableOpacity onPress={() => handleDeleteSection(section.id)}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
          <PortfolioSection
            section={section}
            items={section.items || []}
            editable
            onRemoveItem={(itemId) => handleRemoveItem(section.id, itemId)}
            onItemPress={(item) =>
              router.push(`/(screens)/post/${item.post_id}`)
            }
          />
          <Text style={styles.hintText}>
            Add items by visiting a post and selecting "Add to Portfolio"
          </Text>
        </View>
      ))}

      <Button
        title="Save Changes"
        onPress={handleSave}
        loading={saving}
        size="lg"
        style={styles.saveButton}
      />

      <View style={styles.footer} />
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
  sectionTitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    marginBottom: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  addSectionInput: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    padding: spacing.xs,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionCardTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    color: colors.text,
  },
  hintText: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  saveButton: {
    marginTop: spacing.xxxl,
  },
  footer: {
    height: 40,
  },
});
