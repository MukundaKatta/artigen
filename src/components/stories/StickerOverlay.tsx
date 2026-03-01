import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '@/lib/constants';
import { PollSticker } from './PollSticker';
import { QuizSticker } from './QuizSticker';
import { QuestionSticker } from './QuestionSticker';
import { EmojiSliderSticker } from './EmojiSliderSticker';
import { CountdownSticker } from './CountdownSticker';
import { LinkSticker } from './LinkSticker';
import type { StorySticker } from '@/types';

type Props = {
  stickers: StorySticker[];
  userId: string;
  onRespond: (stickerId: string, response: Record<string, unknown>) => void;
};

export function StickerOverlay({ stickers, userId, onRespond }: Props) {
  if (stickers.length === 0) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {stickers.map((sticker) => {
        const left = sticker.position_x * SCREEN_WIDTH - 75;
        const top = sticker.position_y * SCREEN_HEIGHT - 40;

        const stickerProps = {
          sticker,
          userId,
          onRespond: (response: Record<string, unknown>) => onRespond(sticker.id, response),
        };

        let StickerComponent;
        switch (sticker.sticker_type) {
          case 'poll':
            StickerComponent = <PollSticker {...stickerProps} />;
            break;
          case 'quiz':
            StickerComponent = <QuizSticker {...stickerProps} />;
            break;
          case 'question':
            StickerComponent = <QuestionSticker {...stickerProps} />;
            break;
          case 'emoji_slider':
            StickerComponent = <EmojiSliderSticker {...stickerProps} />;
            break;
          case 'countdown':
            StickerComponent = <CountdownSticker {...stickerProps} />;
            break;
          case 'link':
            StickerComponent = <LinkSticker {...stickerProps} />;
            break;
          default:
            return null;
        }

        return (
          <View key={sticker.id} style={[styles.stickerContainer, { left, top }]}>
            {StickerComponent}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  stickerContainer: {
    position: 'absolute',
    minWidth: 150,
  },
});
