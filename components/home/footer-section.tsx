import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type Props = {
  palette: { card: string; border: string; muted: string };
  textColor: string;
};

export function FooterSection({ palette, textColor }: Props) {
  return (
    <View style={[styles.footer, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <View>
        <ThemedText type="subtitle">Stay in the loop</ThemedText>
        <ThemedText style={[styles.hint, { color: palette.muted }]}>
          Drops, restocks, and styling notes every other week.
        </ThemedText>
      </View>
      <View style={styles.actions}>
        <Pressable style={[styles.ghost, { borderColor: palette.border }]}>
          <ThemedText style={[styles.ctaText, { color: textColor }]}>Sign up</ThemedText>
        </Pressable>
        <Pressable style={[styles.ghost, { borderColor: palette.border }]}>
          <ThemedText style={[styles.ctaText, { color: textColor }]}>Contact</ThemedText>
        </Pressable>
      </View>
      <View style={styles.meta}>
        <ThemedText style={[styles.metaText, { color: palette.muted }]}>
          Free returns within 30 days
        </ThemedText>
        <ThemedText style={[styles.metaText, { color: palette.muted }]}>
          Carbon-neutral delivery
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    padding: 18,
    borderRadius: 0,
    borderWidth: 1,
    gap: 12,
  },
  hint: { lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10 },
  ghost: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 1,
    alignItems: 'center',
  },
  ctaText: { fontWeight: '700' },
  meta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metaText: { fontSize: 12 },
});
