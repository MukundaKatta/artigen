import { Stack } from 'expo-router';
import { colors } from '@/lib/theme';

export default function CameraLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="camera" options={{ title: 'Camera' }} />
      <Stack.Screen name="new-post" options={{ title: 'New Post' }} />
      <Stack.Screen name="new-story" options={{ title: 'New Story' }} />
      <Stack.Screen name="new-reel" options={{ title: 'New Reel' }} />
      <Stack.Screen name="generate" options={{ title: 'Generate with AI' }} />
      <Stack.Screen name="restyle" options={{ title: 'Restyle' }} />
      <Stack.Screen name="animate" options={{ title: 'Animate' }} />
      <Stack.Screen name="remix/[postId]" options={{ title: 'Remix Prompt' }} />
      <Stack.Screen name="inpaint" options={{ title: 'Inpaint' }} />
      <Stack.Screen name="outpaint" options={{ title: 'Outpaint' }} />
      <Stack.Screen name="upscale" options={{ title: 'Upscale' }} />
      <Stack.Screen name="controlnet" options={{ title: 'ControlNet' }} />
    </Stack>
  );
}
