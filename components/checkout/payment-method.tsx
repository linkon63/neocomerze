import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type PaymentMethod = 'cod';

type Props = {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
};

export function PaymentMethodCard({ value, onChange }: Props) {
  const options: { key: PaymentMethod; title: string; hint: string }[] = [
    {
      key: 'cod',
      title: 'Cash on delivery',
      hint: 'Pay with cash when your order arrives.',
    },
  ];

  return (
    <View style={styles.card}>
      <ThemedText type="subtitle">Payment</ThemedText>
      <ThemedText style={styles.hint}>Choose how you want to pay.</ThemedText>
      <View style={styles.list}>
        {options.map((opt) => {
          const isActive = value === opt.key;
          return (
            <Pressable
              key={opt.key}
              style={[
                styles.option,
                {
                  borderColor: isActive ? '#0f766e' : '#e5e7eb',
                  backgroundColor: isActive ? '#ecfdf3' : '#ffffff',
                },
              ]}
              onPress={() => onChange(opt.key)}>
              <Ionicons
                name={isActive ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={isActive ? '#0f766e' : '#9ca3af'}
              />
              <View style={styles.meta}>
                <ThemedText style={styles.title}>{opt.title}</ThemedText>
                <ThemedText style={styles.hint}>{opt.hint}</ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 6 },
  hint: {
    color: '#6b7280',
    fontSize: 12,
  },
  list: {
    gap: 10,
    marginTop: 6,
  },
  option: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontWeight: '800',
  },
});
