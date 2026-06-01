import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { createListing } from '@/services/marketplace.service';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function CreateListingScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'digital_download' | 'print_on_demand'>('digital_download');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!user?.id || !title || !price) return;
    setSaving(true);
    await createListing({
      postId: '', // would come from route params in real flow
      sellerId: user.id,
      listingType: type,
      title,
      description,
      priceCents: Math.round(parseFloat(price) * 100),
    });
    setSaving(false);
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput style={styles.input} placeholder="Title" placeholderTextColor={colors.textSecondary} value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Price (USD)" placeholderTextColor={colors.textSecondary} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
      <TextInput style={[styles.input, styles.multiline]} placeholder="Description" placeholderTextColor={colors.textSecondary} value={description} onChangeText={setDescription} multiline />
      <View style={styles.typeRow}>
        {(['digital_download', 'print_on_demand'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.typeBtn, type === t && styles.typeBtnActive]} onPress={() => setType(t)}>
            <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t === 'digital_download' ? 'Digital' : 'Print'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.5 }]} onPress={handleCreate} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'Creating...' : 'Create Listing'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  input: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.sm, color: colors.text, fontSize: fontSize.sm, marginBottom: spacing.sm },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  typeBtn: { flex: 1, padding: spacing.sm, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  typeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeText: { fontSize: fontSize.sm, color: colors.text, fontFamily: typography.medium },
  typeTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: 8, alignItems: 'center' },
  saveText: { color: '#fff', fontFamily: typography.bold, fontSize: fontSize.md },
});
