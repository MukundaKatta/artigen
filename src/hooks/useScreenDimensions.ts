import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

type ScreenDimensions = { width: number; height: number };

function getCurrent(): ScreenDimensions {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return { width: window.innerWidth, height: window.innerHeight };
  }
  return Dimensions.get('window');
}

/**
 * Returns screen dimensions that update on resize (web) and rotation (native).
 */
export function useScreenDimensions(): ScreenDimensions {
  const [dims, setDims] = useState(getCurrent);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handler = () => setDims({ width: window.innerWidth, height: window.innerHeight });
      window.addEventListener('resize', handler);
      return () => window.removeEventListener('resize', handler);
    }

    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setDims({ width: window.width, height: window.height });
    });
    return () => sub.remove();
  }, []);

  return dims;
}
