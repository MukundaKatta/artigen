import React from 'react';
import { Stack } from 'expo-router';
import { FutureFeatureStub } from '@/components/future/FutureFeatureStub';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { trackEvent, TELEMETRY_EVENTS } from '@/lib/telemetry';

export default function SpatialGalleryScreen() {
  const enabled = isFeatureEnabled('spatial_gallery');

  return (
    <>
      <Stack.Screen options={{ title: 'Spatial Gallery' }} />
      <FutureFeatureStub
        title="Spatial Gallery"
        summary="XR-capable gallery publishing layer for immersive exhibitions and 3D-native showcases."
        enabled={enabled}
        onPrimaryAction={() => trackEvent(TELEMETRY_EVENTS.feature_stub_cta_clicked, { feature: 'spatial_gallery' })}
      />
    </>
  );
}
