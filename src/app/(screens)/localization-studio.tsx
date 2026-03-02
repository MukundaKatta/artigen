import React from 'react';
import { Stack } from 'expo-router';
import { FutureFeatureStub } from '@/components/future/FutureFeatureStub';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { trackEvent, TELEMETRY_EVENTS } from '@/lib/telemetry';

export default function LocalizationStudioScreen() {
  const enabled = isFeatureEnabled('localization_studio');

  return (
    <>
      <Stack.Screen options={{ title: 'Localization Studio' }} />
      <FutureFeatureStub
        title="Localization Studio"
        summary="Auto-dub and subtitle generation pipeline scaffolding for multilingual creator distribution."
        enabled={enabled}
        onPrimaryAction={() => trackEvent(TELEMETRY_EVENTS.feature_stub_cta_clicked, { feature: 'localization_studio' })}
      />
    </>
  );
}
