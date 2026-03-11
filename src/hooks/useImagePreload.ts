import { useEffect, useRef } from 'react';
import { Image, Platform } from 'react-native';

/**
 * Preload images for smoother scrolling and instant display.
 *
 * Works on both native (Image.prefetch) and web (HTMLImageElement).
 * Used in feed and explore screens to preload upcoming images.
 */
export function useImagePreload(urls: string[]) {
  const preloadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    for (const url of urls) {
      if (!url || preloadedRef.current.has(url)) continue;
      preloadedRef.current.add(url);

      if (Platform.OS === 'web') {
        // On web, create a hidden Image element
        const img = new window.Image();
        img.src = url;
      } else {
        // On native, use React Native's prefetch
        Image.prefetch(url).catch(() => {
          // Silently ignore preload failures
          preloadedRef.current.delete(url);
        });
      }
    }
  }, [urls]);
}

/**
 * Preload the next page of images in an infinite scroll feed.
 * Call this with the URLs from the current visible items.
 */
export function preloadImages(urls: string[]): void {
  for (const url of urls) {
    if (!url) continue;
    if (Platform.OS === 'web') {
      const img = new window.Image();
      img.src = url;
    } else {
      Image.prefetch(url).catch(() => {});
    }
  }
}
