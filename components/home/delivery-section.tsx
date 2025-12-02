import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Step = {
  title: string;
  copy: string;
  icon: 'cart.fill' | 'bag.fill' | 'paperplane.fill' | 'chevron.right';
};

const steps: Step[] = [
  { title: 'Place order', copy: 'Instant confirmation with tracking link.', icon: 'cart.fill' },
  { title: 'Packed with care', copy: 'Quality check and secure wrap.', icon: 'bag.fill' },
  { title: 'On the way', copy: 'Local partners deliver fast.', icon: 'paperplane.fill' },
  { title: 'Easy returns', copy: '30-day no-questions returns.', icon: 'chevron.right' },
];

type Props = {
  palette: { accent: string; border: string; card: string; muted: string };
};

export function DeliverySection({ palette }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <ThemedText type="subtitle">How delivery works</ThemedText>
        <ThemedText style={[styles.hint, { color: palette.muted }]}>
          Simple steps from order to doorstep.
        </ThemedText>
      </View>
      <View style={[styles.card, { borderColor: palette.border, backgroundColor: palette.card }]}>
        {steps.map((step) => (
          <View key={step.title} style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: '#fff7ed', borderColor: palette.accent }]}>
              <IconSymbol name={step.icon} color={palette.accent} size={18} />
            </View>
            <View style={styles.copy}>
              <ThemedText style={styles.title}>{step.title}</ThemedText>
              <ThemedText style={[styles.text, { color: palette.muted }]}>{step.copy}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  header: { gap: 4 },
  hint: { lineHeight: 20 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 2 },
  title: { fontWeight: '700', fontSize: 14 },
  text: { fontSize: 12, lineHeight: 16 },
});
