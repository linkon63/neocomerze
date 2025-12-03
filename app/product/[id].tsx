import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/context/cart-context';
import { endpoints } from '@/constants/api';

type ApiProductDetail = {
  id: number;
  name?: { en?: string };
  description?: { en?: string };
  media?: { original_url?: string }[];
  variants?: {
    id: number;
    sku?: string;
    current_pricing?: { unit_price?: string };
    option_values?: { id: number; name?: { en?: string }; option_name?: { en?: string } }[];
  }[];
};

type VariantOption =
  NonNullable<NonNullable<ApiProductDetail['variants']>[number]['option_values']>[number];

const getOptionKey = (opt: VariantOption, index: number) =>
  opt?.option_name?.en?.trim() || `option-${index}`;
const getOptionLabel = (opt: VariantOption, index: number) =>
  opt?.option_name?.en?.trim() || `Option ${index + 1}`;
const getOptionValueLabel = (opt: VariantOption) =>
  opt?.name?.en || opt?.option_name?.en || `Value ${opt?.id ?? ''}`;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { addItem } = useCart();

  const palette = useMemo(
    () => ({
      background: isDark ? '#0f1115' : '#ffffff',
      card: isDark ? '#1a1d24' : '#ffffff',
      muted: isDark ? '#7b828f' : '#6b7280',
      accent: isDark ? '#f47223' : '#f85606',
      border: isDark ? '#252832' : '#e5e7eb',
    }),
    [isDark]
  );

  const [product, setProduct] = useState<ApiProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});

  const optionGroups = useMemo(() => {
    const groups: Record<
      string,
      { key: string; label: string; values: { id: number; label: string }[] }
    > = {};
    product?.variants?.forEach((variant) => {
      variant.option_values?.forEach((opt, idx) => {
        if (!opt?.id) return;
        const key = getOptionKey(opt, idx);
        const label = getOptionLabel(opt, idx);
        const valueLabel = getOptionValueLabel(opt);
        const existing = groups[key];
        const values = existing?.values ?? [];
        if (!values.some((v) => v.id === opt.id)) {
          values.push({ id: opt.id, label: valueLabel });
        }
        groups[key] = {
          key,
          label,
          values,
        };
      });
    });
    return Object.values(groups);
  }, [product]);

  const findVariantForSelections = (
    variants: ApiProductDetail['variants'],
    selections: Record<string, number>
  ) => {
    if (!variants?.length) return null;
    return (
      variants.find((variant) => {
        const map = new Map<string, number>();
        variant.option_values?.forEach((opt, idx) => {
          if (opt?.id) map.set(getOptionKey(opt, idx), opt.id);
        });
        return Object.entries(selections).every(
          ([key, val]) => map.has(key) && map.get(key) === val
        );
      }) ?? null
    );
  };

  useEffect(() => {
    navigation.setOptions({ title: 'Product detail' });
  }, [navigation]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(endpoints.productDetail(id));
        const json = await res.json();
        if (isMounted) {
          setProduct(json?.data as ApiProductDetail);
          const firstVariant = json?.data?.variants?.[0];
          if (firstVariant?.id) {
            setSelectedVariantId(firstVariant.id);
            const initialSelections: Record<string, number> = {};
            firstVariant.option_values?.forEach((opt, idx) => {
              if (opt?.id) {
                const key = getOptionKey(opt, idx);
                initialSelections[key] = opt.id;
              }
            });
            setSelectedOptions(initialSelections);
          }
        }
      } catch (err) {
        if (isMounted) setError('Could not load product.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleOptionSelect = (groupKey: string, valueId: number) => {
    if (!product?.variants?.length) return;
    const updatedSelections = { ...selectedOptions, [groupKey]: valueId };
    const matched = findVariantForSelections(product.variants, updatedSelections);
    if (matched) {
      setSelectedOptions(updatedSelections);
      setSelectedVariantId(matched.id);
      return;
    }
    const fallback = product.variants.find((variant) =>
      variant.option_values?.some(
        (opt, idx) => getOptionKey(opt, idx) === groupKey && opt?.id === valueId
      )
    );
    if (fallback) {
      const fallbackSelections: Record<string, number> = { ...updatedSelections };
      fallback.option_values?.forEach((opt, idx) => {
        if (opt?.id) {
          fallbackSelections[getOptionKey(opt, idx)] = opt.id;
        }
      });
      setSelectedOptions(fallbackSelections);
      setSelectedVariantId(fallback.id);
    } else {
      setSelectedOptions(updatedSelections);
      setSelectedVariantId(null);
    }
  };

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return undefined;
    const direct = product.variants.find((v) => v.id === selectedVariantId);
    if (direct) return direct;
    return findVariantForSelections(product.variants, selectedOptions) ?? undefined;
  }, [product, selectedVariantId, selectedOptions]);
  const price = selectedVariant?.current_pricing?.unit_price;
  const images = product?.media ?? [];

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.variants?.length && !selectedVariant) return;
    const variantLabel =
      selectedVariant?.option_values
        ?.map((o) => o.name?.en)
        .filter(Boolean)
        .join(' / ') || selectedVariant?.sku;

    addItem(
      {
        id: product.id,
        name: product.name?.en ?? 'Product',
        price: price ?? 'BDT —',
        image: product.media?.[0]?.original_url,
        variantId: selectedVariant?.id ?? selectedVariantId,
        variantLabel,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ThemedView style={[styles.screen, { backgroundColor: palette.background }]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={palette.accent} />
              <ThemedText style={{ color: palette.muted }}>Loading product…</ThemedText>
            </View>
          ) : error ? (
            <View style={styles.loadingWrap}>
              <ThemedText style={{ color: palette.muted }}>{error}</ThemedText>
            </View>
          ) : !product ? (
            <View style={styles.loadingWrap}>
              <ThemedText style={{ color: palette.muted }}>Product not found.</ThemedText>
            </View>
          ) : (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imageRail}>
                {images.length ? (
                  images.map((img, idx) => (
                    <Image
                      key={img.original_url ?? idx}
                      source={img.original_url}
                      style={styles.heroImage}
                      contentFit="cover"
                    />
                  ))
                ) : (
                  <View
                    style={[
                      styles.heroImage,
                      { backgroundColor: isDark ? '#15191f' : '#e4ddd1' },
                    ]}
                  />
                )}
              </ScrollView>

              <View style={styles.metaCard}>
                <ThemedText type="title">{product.name?.en ?? 'Product'}</ThemedText>
                {price ? (
                  <ThemedText style={[styles.price, { color: palette.accent }]}>{price}</ThemedText>
                ) : null}

                {optionGroups.length ? (
                  <View style={styles.variantSection}>
                    <ThemedText type="subtitle">Variant options</ThemedText>
                    {optionGroups.map((group) => (
                      <View key={group.key} style={styles.optionGroup}>
                        <ThemedText style={styles.optionLabel}>{group.label}</ThemedText>
                        <View style={styles.variantList}>
                          {group.values.map((value) => {
                            const isSelected = selectedOptions[group.key] === value.id;
                            return (
                              <Pressable
                                key={value.id}
                                style={[
                                  styles.variantPill,
                                  {
                                    borderColor: isSelected ? palette.accent : palette.border,
                                    backgroundColor: isSelected ? '#e9f3ef' : palette.card,
                                  },
                                ]}
                                onPress={() => handleOptionSelect(group.key, value.id)}>
                                <ThemedText
                                  style={[
                                    styles.variantText,
                                    isSelected ? { color: palette.accent } : null,
                                  ]}>
                                  {value.label}
                                </ThemedText>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : product.variants?.length ? (
                  <View style={styles.variantSection}>
                    <ThemedText type="subtitle">Variants</ThemedText>
                    <View style={styles.variantList}>
                      {product.variants.map((variant) => (
                        <Pressable
                          key={variant.id}
                          style={[
                            styles.variantPill,
                            {
                              borderColor:
                                selectedVariantId === variant.id ? palette.accent : palette.border,
                              backgroundColor:
                                selectedVariantId === variant.id ? '#e9f3ef' : palette.card,
                            },
                          ]}
                          onPress={() => setSelectedVariantId(variant.id)}>
                          <ThemedText
                            style={[
                              styles.variantText,
                              selectedVariantId === variant.id ? { color: palette.accent } : null,
                            ]}>
                            {variant.option_values
                              ?.map((o) => o.name?.en)
                              .filter(Boolean)
                              .join(' / ') ||
                              variant.sku ||
                              `Variant ${variant.id}`}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ) : null}

                <View style={styles.quantityRow}>
                  <ThemedText style={styles.quantityLabel}>Quantity</ThemedText>
                  <View style={styles.quantityControls}>
                    <Pressable
                      style={[
                        styles.quantityButton,
                        { borderColor: palette.border, backgroundColor: palette.card },
                      ]}
                      onPress={() => handleQuantityChange(-1)}>
                      <ThemedText style={styles.quantitySymbol}>-</ThemedText>
                    </Pressable>
                    <ThemedText style={styles.quantityValue}>{quantity}</ThemedText>
                    <Pressable
                      style={[
                        styles.quantityButton,
                        { borderColor: palette.accent, backgroundColor: '#e9f3ef' },
                      ]}
                      onPress={() => handleQuantityChange(1)}>
                      <ThemedText style={[styles.quantitySymbol, { color: palette.accent }]}>
                        +
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    style={[styles.primaryButton, { backgroundColor: palette.accent }]}
                    onPress={handleAddToCart}>
                    <ThemedText style={[styles.primaryText, { color: '#ffffff' }]}>
                      Add to cart
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.ghostButton, { borderColor: palette.accent }]}
                    onPress={handleBuyNow}>
                    <ThemedText style={[styles.ghostText, { color: palette.accent }]}>
                      Buy now
                    </ThemedText>
                  </Pressable>
                </View>
              </View>

              <View style={styles.metaCard}>
                <ThemedText type="subtitle">Description</ThemedText>
                <ThemedText style={[styles.description, { color: palette.muted }]}>
                  {product.description?.en || 'No description available.'}
                </ThemedText>
              </View>
            </>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const heroWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  content: { padding: 20, gap: 20, paddingBottom: 32 },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  imageRail: {
    gap: 12,
  },
  heroImage: {
    width: heroWidth - 40,
    height: 280,
    borderRadius: 0,
    overflow: 'hidden',
  },
  metaCard: {
    gap: 14,
  },
  price: {
    fontWeight: '700',
    fontSize: 15,
  },
  variantSection: {
    gap: 10,
  },
  description: {
    lineHeight: 17,
    fontSize: 13,
  },
  variantList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  variantPill: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 0,
    borderWidth: 1,
  },
  optionGroup: {
    gap: 8,
  },
  optionLabel: {
    fontWeight: '700',
    fontSize: 13,
  },
  variantText: {
    fontWeight: '600',
    fontSize: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontWeight: '600',
    fontSize: 13,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantitySymbol: {
    fontWeight: '800',
    fontSize: 16,
  },
  quantityValue: {
    fontWeight: '700',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#0f1115',
  },
  ghostButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  ghostText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
