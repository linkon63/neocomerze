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
import { endpoints } from '@/constants/api';

export default function CheckoutScreen() {
  const { items, clear, showToast } = useCart();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const accent = isDark ? '#f47223' : '#f85606';
  const [selectedAddress, setSelectedAddress] = useState<CheckoutAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod'>('cod');
  const [placing, setPlacing] = useState(false);

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

  const handlePlaceOrder = async () => {
    if (!items.length) {
      showToast('Cart is empty');
      return;
    }
    if (!selectedAddress) {
      showToast('Select an address');
      return;
    }
    if (!selectedAddress.customerId) {
      showToast('Missing customer');
      return;
    }

    const buildAddressPayload = (type: 'billing' | 'shipping') => ({
      first_name: selectedAddress.firstName || selectedAddress.label.split(' ')[0] || 'Customer',
      last_name: selectedAddress.lastName || selectedAddress.label.split(' ').slice(1).join(' ') || '',
      phone: selectedAddress.phone || '',
      state: selectedAddress.state || '',
      city: selectedAddress.city || '',
      area: selectedAddress.area || selectedAddress.address,
      postcode: selectedAddress.postcode || '',
      address: selectedAddress.address,
      landmark: '',
      type,
    });

    const payload = {
      customer_id: Number(selectedAddress.customerId) || selectedAddress.customerId,
      channel_id: 2,
      amount_due: total,
      amount_paid: 0,
      amount_change: 0,
      billing_address: buildAddressPayload('billing'),
      shipping_address: buildAddressPayload('shipping'),
      payment: {
        intent: 'sale',
        status: 'unpaid',
        meta_data: [
          {
            provider: 'Cash on Delivery',
            type: 'cash',
            amount: total.toString(),
            payment_information: 'Cash on Delivery',
            vouchers: [],
          },
        ],
      },
      purchasable: items.map((item) => ({
        id: item.variantId ?? item.id,
        quantity: item.quantity,
        discount_should_apply: false,
        order_quantity: item.quantity,
        uom_id: 2,
        uom: 'pcs',
        order_uom_id: 1,
        order_uom: 'pcs',
        batch_id: null,
      })),
      meta_data: {
        shipping_charge: {
          amount: delivery,
          currency_code: 'BDT',
        },
      },
    };

    try {
      setPlacing(true);
      const res = await fetch(endpoints.orders, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Order failed (${res.status})`);
      }
      showToast('Order placed');
      clear();
      router.replace('/');
    } catch (err: any) {
      showToast(err?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
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
            style={[
              styles.checkoutButton,
              { backgroundColor: accent, opacity: placing ? 0.7 : 1 },
            ]}
            disabled={placing}
            onPress={handlePlaceOrder}>
            <ThemedText style={styles.checkoutText}>
              {placing ? 'Placing…' : 'Place Order'}
            </ThemedText>
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
