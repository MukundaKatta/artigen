import { useState, useCallback } from 'react';
import { sendTip as sendTipApi } from '@/services/tip.service';
import { TIP_PRESETS } from '@/lib/constants';

export function useTipJar(senderId?: string) {
  const [sending, setSending] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(TIP_PRESETS[1]);

  const sendTip = useCallback(async (recipientId: string, postId?: string, message?: string) => {
    if (!senderId) return { error: new Error('Not logged in') };
    setSending(true);
    const result = await sendTipApi({
      senderId,
      recipientId,
      postId,
      amountCents: selectedAmount,
      message,
    });
    setSending(false);
    return result;
  }, [senderId, selectedAmount]);

  return {
    sending,
    selectedAmount,
    setSelectedAmount,
    presets: TIP_PRESETS,
    sendTip,
  };
}
