import React from 'react';
import { Stack } from 'expo-router';
import { FutureFeatureStub } from '@/components/future/FutureFeatureStub';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { trackEvent, TELEMETRY_EVENTS } from '@/lib/telemetry';

export default function DirectorModeScreen() {
  const enabled = isFeatureEnabled('director_mode');

  return (
    <>
      <Stack.Screen options={{ title: 'Director Mode' }} />
      <FutureFeatureStub
        title="Director Mode"
        summary="Agentic planning mode that orchestrates multi-step creation pipelines from a single objective."
        enabled={enabled}
        onPrimaryAction={() => trackEvent(TELEMETRY_EVENTS.feature_stub_cta_clicked, { feature: 'director_mode' })}
      />
    </>
  );
}
