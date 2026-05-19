import { supabase } from '@/lib/supabase';
import { openBrowserAsync } from 'expo-web-browser';

export type CreditPackage = {
  id: string;
  label: string;
  price_usd: number;
  price_inr: number;
  credits: number;
  bonus: number; // percentage bonus over base
  popular?: boolean;
};

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'starter', label: 'Starter', price_usd: 2, price_inr: 166, credits: 2500, bonus: 0 },
  {
    id: 'popular',
    label: 'Popular',
    price_usd: 5,
    price_inr: 415,
    credits: 6500,
    bonus: 30,
    popular: true,
  },
  { id: 'pro', label: 'Pro', price_usd: 10, price_inr: 830, credits: 14000, bonus: 40 },
  { id: 'studio', label: 'Studio', price_usd: 25, price_inr: 2075, credits: 37500, bonus: 50 },
];

// Credit costs per model (mirrors edge function MODEL_CREDITS)
export const MODEL_CREDITS: Record<string, number> = {
  'black-forest-labs/FLUX.1-schnell': 0,
  'stabilityai/stable-diffusion-xl-base-1.0': 0,
  'stabilityai/stable-diffusion-2-1': 0,
  'runwayml/stable-diffusion-v1-5': 0,
  'black-forest-labs/flux-schnell': 5,
  'black-forest-labs/flux-dev': 30,
  'stability-ai/sdxl': 10,
  'stability-ai/stable-diffusion-3': 30,
  'dall-e-3-standard': 40,
  'dall-e-3-hd': 80,
  'imagen-3': 25,
  'imagen-4': 35,
  'black-forest-labs/flux-2-schnell': 8,
  'black-forest-labs/flux-2-dev': 40,
};

export const TEXT_AI_CREDITS = 5; // per call

export type RazorpayOrder = {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  credits: number;
  label: string;
};

export async function getUserCredits(userId: string): Promise<number> {
  const { data } = await supabase
    .from('wallets')
    .select('balance_cents')
    .eq('user_id', userId)
    .maybeSingle();
  return data?.balance_cents ?? 0;
}

export async function getCreditTransactions(userId: string) {
  const { data } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('wallets.user_id', userId)
    .in('type', ['purchase', 'deposit'])
    .order('created_at', { ascending: false })
    .limit(20);
  return data ?? [];
}

export async function createStripeCheckout(
  packageId: string,
): Promise<{ checkout_url: string | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { package_id: packageId },
  });
  if (error) return { checkout_url: null, error: error.message };
  if (data?.error) return { checkout_url: null, error: data.error };
  return { checkout_url: data.checkout_url, error: null };
}

export async function createRazorpayOrder(
  packageId: string,
): Promise<{ order: RazorpayOrder | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
    body: { package_id: packageId },
  });
  if (error) return { order: null, error: error.message };
  if (data?.error) return { order: null, error: data.error };
  return { order: data as RazorpayOrder, error: null };
}

export async function openStripeCheckout(packageId: string): Promise<{ error: string | null }> {
  const { checkout_url, error } = await createStripeCheckout(packageId);
  if (error || !checkout_url) return { error: error || 'Failed to create checkout' };
  await openBrowserAsync(checkout_url);
  return { error: null };
}
