import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = {
  showSensitive: boolean;
  showMature: boolean;
  blurNsfw: boolean;
  onToggleSensitive: (v: boolean) => void;
  onToggleMature: (v: boolean) => void;
  onToggleBlur: (v: boolean) => void;
};

export function SafetySettings(props: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.label}>Show Sensitive Content</Text>
          <Text style={styles.desc}>See posts marked as sensitive</Text>
        </View>
        <Switch value={props.showSensitive} onValueChange={props.onToggleSensitive} trackColor={{ true: colors.primary }} />
      </View>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.label}>Show Mature Content</Text>
          <Text style={styles.desc}>See posts marked as mature</Text>
        </View>
        <Switch value={props.showMature} onValueChange={props.onToggleMature} trackColor={{ true: colors.primary }} />
      </View>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.label}>Blur NSFW Content</Text>
          <Text style={styles.desc}>Always blur NSFW posts until tapped</Text>
        </View>
        <Switch value={props.blurNsfw} onValueChange={props.onToggleBlur} trackColor={{ true: colors.primary }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  info: { flex: 1, marginRight: spacing.md },
  label: { fontSize: fontSize.sm, fontFamily: typography.bold, color: colors.text },
  desc: { fontSize: fontSize.xs, color: colors.textSecondary },
});
