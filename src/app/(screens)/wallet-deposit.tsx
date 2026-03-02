import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

// Redirect to buy-credits screen
export default function WalletDepositScreen() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(screens)/buy-credits');
  }, [router]);
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
