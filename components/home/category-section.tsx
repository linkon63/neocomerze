import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CategoryItem } from './types';

type Props = {
  categories: CategoryItem[];
  loading: boolean;
  error: string | null;
  palette: { accent: string; border: string; card: string; muted: string };
  isDark: boolean;
  onPress: (category: CategoryItem) => void;
};

export function CategorySection({ categories, loading, error, palette, isDark, onPress }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Category</ThemedText>
      </View>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={palette.accent} />
          <ThemedText style={{ color: palette.muted }}>Loading categories…</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.loadingWrap}>
          <ThemedText style={{ color: palette.muted }}>{error}</ThemedText>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
          {categories.map((category) => (
            <Pressable key={category.id} onPress={() => onPress(category)}>
              <View
                style={[
                  styles.card,
                  { borderColor: palette.border, backgroundColor: palette.card },
                ]}>
                {category.image ? (
                  <Image source={category.image} style={styles.image} contentFit="cover" />
                ) : (
                  <View
                    style={[
                      styles.image,
                      { backgroundColor: palette.card },
                    ]}
                  />
                )}
                <View style={styles.overlay}>
                  <ThemedText style={styles.label}>{category.name}</ThemedText>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  header: {
    gap: 4,
  },
  rail: {
    gap: 10,
    paddingVertical: 6,
  },
  card: {
    width: 120,
    height: 90,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  label: {
    fontWeight: '600',
    fontSize: 13,
    color: '#ffffff',
    textAlign: 'center',
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
});
