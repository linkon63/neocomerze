import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/cart-context';
import { AddressSelector, CheckoutAddress } from '@/components/checkout/address-selector';
import { PaymentMethodCard } from '@/components/checkout/payment-method';
import { CartLines } from '@/components/checkout/cart-lines';

export default function CheckoutScreen() {
  const { items, clear, showToast } = useCart();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const accent = isDark ? '#81c8be' : '#0f766e';
  const [selectedAddress, setSelectedAddress] = useState<CheckoutAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod'>('cod');

  const parsePrice = (price: string) => {
    const numeric = parseFloat(price.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0),
    [items]
  );

  const delivery = items.length ? 0 : 0;
  const total = subtotal + delivery;

  const handlePlaceOrder = () => {
    if (!items.length) {
      showToast('Cart is empty');
      return;
    }
    if (!selectedAddress) {
      showToast('Select an address');
      return;
    }
    showToast('Order placed (COD)');
    clear();
    router.replace('/');
  };

  if (!items.length) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
        <ThemedView style={styles.empty}>
          <ThemedText type="title">Your cart is empty</ThemedText>
          <ThemedText style={styles.emptyHint}>Add items before checkout.</ThemedText>
          <ThemedText style={[styles.link, { color: accent }]} onPress={() => router.replace('/products')}>
            Browse products
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <ThemedView style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Ionicons name="arrow-back" size={22} color={accent} onPress={() => router.back()} />
            <View>
              <ThemedText type="title">Checkout</ThemedText>
              <ThemedText style={styles.hint}>Minimal steps to place your order.</ThemedText>
            </View>
          </View>

          <View style={styles.card}>
            <CartLines items={items} accent={accent} />
            <View style={styles.breaker} />
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
              <ThemedText style={styles.summaryValue}>BDT {subtotal.toFixed(2)}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Delivery</ThemedText>
              <ThemedText style={styles.summaryValue}>{delivery ? `BDT ${delivery.toFixed(2)}` : 'Free'}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={[styles.summaryLabel, styles.totalLabel]}>Total</ThemedText>
              <ThemedText style={[styles.summaryValue, styles.totalValue]}>BDT {total.toFixed(2)}</ThemedText>
            </View>
          </View>

          <View style={styles.card}>
            <AddressSelector selectedId={selectedAddress?.id ?? null} onSelect={setSelectedAddress} />
          </View>

          <View style={styles.card}>
            <PaymentMethodCard value={paymentMethod} onChange={setPaymentMethod} />
          </View>
        </ScrollView>

        <View style={[styles.ctaBar, { borderColor: isDark ? '#252832' : '#e5e7eb' }]}>
          <View>
            <ThemedText style={styles.ctaTotal}>BDT {total.toFixed(2)}</ThemedText>
            <ThemedText style={styles.hint}>Due on delivery</ThemedText>
          </View>
          <View style={{ flex: 1 }} />
          <Pressable
            style={[styles.checkoutButton, { backgroundColor: accent }]}
            onPress={handlePlaceOrder}>
            <ThemedText style={styles.checkoutText}>Place order (COD)</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  breaker: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#374151',
  },
  summaryValue: {
    fontWeight: '700',
    fontSize: 13,
  },
  totalLabel: { fontWeight: '800', fontSize: 14 },
  totalValue: { fontSize: 16 },
  ctaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  checkoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  checkoutText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  ctaTotal: { fontWeight: '800', fontSize: 16 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  emptyHint: {
    color: '#6b7280',
  },
  link: {
    fontWeight: '700',
  },
});
