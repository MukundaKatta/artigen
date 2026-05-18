import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, fontSize, typography } from '@/lib/theme';
import { parseRichText } from '@/lib/parse-rich-text';

type RichTextProps = {
  children: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  username?: string; // The post author's username (for display before caption)
};

export function RichText({ children, style, numberOfLines, username }: RichTextProps) {
  const router = useRouter();

  function handleMentionPress(mention: string) {
    const usernameClean = mention.slice(1); // Remove @
    // Look up user by username and navigate
    supabase
      .from('profiles')
      .select('id')
      .eq('username', usernameClean)
      .single()
      .then(({ data }) => {
        if (data) {
          router.push(`/(screens)/user/${data.id}`);
        }
      });
  }

  function handleHashtagPress(hashtag: string) {
    const name = hashtag.slice(1); // Remove #
    router.push(`/(screens)/hashtag/${name}`);
  }

  const parts = parseRichText(children);

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {username && (
        <Text style={styles.username}>{username}  </Text>
      )}
      {parts.map((part, index) => {
        const key = `${index}-${part.value}`;
        if (part.type === 'mention') {
          return (
            <Text
              key={key}
              style={styles.mention}
              onPress={() => handleMentionPress(part.value)}
            >
              {part.value}
            </Text>
          );
        }
        if (part.type === 'hashtag') {
          return (
            <Text
              key={key}
              style={styles.hashtag}
              onPress={() => handleHashtagPress(part.value)}
            >
              {part.value}
            </Text>
          );
        }
        return <Text key={key}>{part.value}</Text>;
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  username: {
    fontFamily: typography.semiBold,
    fontWeight: '600',
  },
  mention: {
    color: colors.primary,
    fontFamily: typography.medium,
  },
  hashtag: {
    color: colors.primary,
    fontFamily: typography.medium,
  },
});
