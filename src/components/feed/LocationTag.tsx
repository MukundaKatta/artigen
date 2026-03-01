import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, typography } from '@/lib/theme';

type Props = {
  locationId?: string | null;
  locationName: string;
};

export function LocationTag({ locationId, locationName }: Props) {
  const router = useRouter();

  if (!locationName) return null;

  return (
    <TouchableOpacity
      onPress={() => {
        if (locationId) {
          router.push(`/(screens)/location/${locationId}`);
        }
      }}
      disabled={!locationId}
    >
      <Text style={styles.text} numberOfLines={1}>
        {locationName}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.regular,
    marginTop: 1,
  },
});
