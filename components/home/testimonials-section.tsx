import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type Testimonial = {
  quote: string;
  name: string;
  image?: string;
  rating: number;
};

type Props = {
  testimonials: Testimonial[];
  width: number;
  palette: { accent: string };
  isDark: boolean;
};

export function TestimonialsSection({ testimonials, width, palette, isDark }: Props) {
  const ref = useRef<ScrollView | null>(null);
  const snapWidth = width + 12;
  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % testimonials.length;
      ref.current?.scrollTo({ x: idx * snapWidth, animated: true });
    }, 3200);
    return () => clearInterval(interval);
  }, [snapWidth, testimonials.length]);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Testimonials</ThemedText>
        <ThemedText style={styles.hint}>What our customers are saying.</ThemedText>
      </View>
      <ScrollView
        horizontal
        pagingEnabled
        ref={ref}
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapWidth}
        decelerationRate="fast"
        contentContainerStyle={[styles.rail, { paddingHorizontal: 0 }]}>
        {testimonials.map((item) => (
          <View
            key={item.name}
            style={[
              styles.card,
              {
                width,
                borderColor: palette.accent,
                backgroundColor: isDark ? '#1f1b17' : '#fff6ef',
              },
            ]}>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>Trusted buyers</ThemedText>
            </View>
            <ThemedText style={styles.quote}>{item.quote}</ThemedText>
            <View style={styles.footer}>
              {item.image ? (
                <Image source={item.image} style={styles.avatar} contentFit="cover" />
              ) : null}
              <ThemedText style={styles.name}>{item.name}</ThemedText>
            </View>
            <ThemedText style={styles.rating}>
              {'★'.repeat(Math.floor(item.rating)) + (item.rating % 1 ? '½' : '')}
            </ThemedText>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  header: { gap: 4 },
  hint: { lineHeight: 20, color: '#6b7280' },
  rail: { gap: 12 },
  card: {
    borderWidth: 1,
    borderRadius: 0,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  quote: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d9d9d9',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff22',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f85606',
  },
  rating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f59e0b',
  },
});
