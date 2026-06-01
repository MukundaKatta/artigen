import { useState, useCallback, useEffect } from 'react';
import { getProvenance, verifyProvenance } from '@/services/provenance.service';

export function useProvenance(postId?: string) {
  const [provenance, setProvenance] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const { data } = await getProvenance(postId);
    setProvenance(data);
    setLoading(false);
  }, [postId]);

  useEffect(() => { fetch(); }, [fetch]);

  const verify = useCallback(async () => {
    if (!postId) return;
    return verifyProvenance(postId);
  }, [postId]);

  return { provenance, loading, verify, refresh: fetch };
}
