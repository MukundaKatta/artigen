import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, fontSize, typography } from '@/lib/theme';

type RichTextProps = {
  children: string;
  style?: any;
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

  // Split text into segments: plain text, @mentions, and #hashtags
  const regex = /([@#][a-zA-Z0-9._]+)/g;
  const parts = children.split(regex);

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {username && (
        <Text style={styles.username}>{username}  </Text>
      )}
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          return (
            <Text
              key={index}
              style={styles.mention}
              onPress={() => handleMentionPress(part)}
            >
              {part}
            </Text>
          );
        }
        if (part.startsWith('#')) {
          return (
            <Text
              key={index}
              style={styles.hashtag}
              onPress={() => handleHashtagPress(part)}
            >
              {part}
            </Text>
          );
        }
        return <Text key={index}>{part}</Text>;
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
