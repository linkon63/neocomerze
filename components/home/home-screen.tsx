import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { useCart } from '@/context/cart-context';
import { endpoints } from '@/constants/api';
import { fetchJson } from '@/utils/api-client';
import { NavBar } from './nav-bar';
import { HeroCarousel } from './hero-carousel';
import { CategorySection } from './category-section';
import { FeaturedProductsSection } from './featured-products';
import { TestimonialsSection } from './testimonials-section';
import { LatestArrivals } from './latest-arrivals';
import { FooterSection } from './footer-section';
import { CategoryItem, HeroSlide, ProductCard, GeneralInfo } from '@/types/home';
import { DeliverySection } from './delivery-section';

const fallbackHeroSlides: HeroSlide[] = [
  {
    id: 'fallback-1',
    title: 'Tailored looks',
    copy: 'Layered textures, clean silhouettes, and color that feels curated.',
    cta: 'Shop new arrivals',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
    tone: '#0b3b3c',
  },
  {
    id: 'fallback-2',
    title: 'Everyday carry',
    copy: 'Utility-forward bags and tools built to move with you.',
    cta: 'See travel edit',
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
    tone: '#523423',
  },
  {
    id: 'fallback-3',
    title: 'Home rituals',
    copy: 'Warm light, sculpted ceramics, and small luxuries for slow nights in.',
    cta: 'Refresh your space',
    image:
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80',
    tone: '#2f2b33',
  },
];

type ApiCategory = {
  id: number;
  name?: { en?: string };
  media?: { original_url?: string }[];
};

type ApiCampaignItem = {
  id: number;
  media?: { original_url?: string }[];
};

type ApiCampaign = {
  id: number;
  name?: string;
  items?: ApiCampaignItem[];
};

type ApiProduct = {
  id: number;
  name?: { en?: string };
  media?: { original_url?: string }[];
  tags?: { name?: string }[];
  variants?: { current_pricing?: { unit_price?: string } }[];
  description?: { en?: string };
};

const testimonials = [
  {
    quote: '“Fast delivery and the quality exceeded expectations.”',
    name: 'Farhana, Dhaka',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
  {
    quote: '“Minimal designs, premium feel—love the curation.”',
    name: 'Arman, Chattogram',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80',
    rating: 4.5,
  },
  {
    quote: '“Customer support was smooth and the fit guide helped a lot.”',
    name: 'Nadia, Sylhet',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
  {
    quote: '“The packaging was premium and items matched the photos perfectly.”',
    name: 'Rafi, Rajshahi',
    image:
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80',
    rating: 4.8,
  },
  {
    quote: '“Flash deals are unbeatable—keeps me coming back every week.”',
    name: 'Tania, Khulna',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    rating: 4.7,
  },
];

export default function HomeScreen() {
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

  const screenWidth = Dimensions.get('window').width;
  const horizontalGutter = 24;
  const heroWidth = screenWidth - horizontalGutter * 2;
  const heroHeight = Math.max(180, Math.min(heroWidth * 0.52, 320));

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(fallbackHeroSlides);
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [generalInfo, setGeneralInfo] = useState<GeneralInfo | null>(null);
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const testimonialWidth = screenWidth - 48;
  const generalPhone =
    generalInfo?.top_bar_slogan?.match(/(\+?\d[\d\s-]+)/)?.[1]?.trim() || undefined;
  const generalLogo = generalInfo?.media?.[0]?.original_url;

  useEffect(() => {
    let isMounted = true;

    const loadCampaigns = async () => {
      try {
        const json = await fetchJson<{ data?: ApiCampaign[] }>(endpoints.campaigns);
        const tones = ['#0b3b3c', '#523423', '#2f2b33', '#1d2b3a', '#153336'];

        const mapped: HeroSlide[] =
          (json?.data as ApiCampaign[] | undefined)?.flatMap((campaign, campaignIndex) =>
            (campaign.items ?? []).map((item, itemIndex) => {
              const toneIndex = (campaignIndex + itemIndex) % tones.length;
              return {
                id: item.id,
                title: campaign.name ?? 'Campaign',
                copy: 'Seasonal campaigns, curated for you.',
                cta: 'Shop now',
                image: item.media?.[0]?.original_url,
                tone: tones[toneIndex],
              };
            })
          ) ?? [];

        if (isMounted && mapped.length) {
          setHeroSlides(mapped);
        }
      } catch (err) {
        // Swallow errors and keep fallbacks
      }
    };

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const json = await fetchJson<{ data?: ApiProduct[] }>(endpoints.products);
        const mapped: ProductCard[] = (json?.data)?.map((item) => {
          const firstVariant = item.variants?.[0];
          return {
            id: item.id,
            name: item.name?.en ?? 'Unnamed item',
            price: firstVariant?.current_pricing?.unit_price ?? 'BDT —',
            image: item.media?.[0]?.original_url,
            badge: item.tags?.[0]?.name,
            description: item.description?.en,
          };
        }) ?? [];

        if (isMounted) {
          setProducts(mapped.slice(0, 8));
        }
      } catch (err) {
        if (isMounted) {
          setError('Could not load products right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        const json = await fetchJson<{ data?: ApiCategory[] }>(endpoints.categories);
        const mapped =
          (json?.data)?.map((item) => ({
            id: item.id,
            name: item.name?.en ?? 'Untitled category',
            image: item.media?.[0]?.original_url,
          })) ?? [];

        if (isMounted) {
          setCategories(mapped.slice(0, 12));
        }
      } catch (err) {
        if (isMounted) {
          setCategoriesError('Could not load categories right now.');
        }
      } finally {
        if (isMounted) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCampaigns();
    loadProducts();
    loadCategories();
    fetchJson<{ generalInfo?: GeneralInfo }>(endpoints.generalInfo)
      .then((json) => {
        if (json?.generalInfo && isMounted) {
          setGeneralInfo(json.generalInfo);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
      edges={['top', 'left', 'right']}>
      <ThemedView style={[styles.screen, { backgroundColor: palette.background }]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <NavBar
            accent={palette.accent}
            onProfilePress={() => router.push('/profile')}
            onSearch={(value) => console.log('search', value)}
            logoUrl={generalLogo}
            shopName={generalInfo?.shop_name}
          />

          <HeroCarousel
            slides={heroSlides}
            heroWidth={heroWidth}
            heroHeight={heroHeight}
            borderColor={palette.border}
            horizontalGutter={horizontalGutter}
          />

          <CategorySection
            categories={categories}
            loading={categoriesLoading}
            error={categoriesError}
            palette={{ accent: palette.accent, border: palette.border, card: palette.card, muted: palette.muted }}
            isDark={isDark}
            onPress={(cat) =>
              router.push(`/category/${cat.id}?name=${encodeURIComponent(cat.name)}`)
            }
          />

          <FeaturedProductsSection
            products={products}
            loading={loading}
            error={error}
            palette={{ accent: palette.accent, border: palette.border, card: palette.card, muted: palette.muted }}
            isDark={isDark}
            onAdd={(product) => addItem({ ...product, variantId: null, variantLabel: undefined })}
            onPressProduct={(id) => router.push(`/product/${id}`)}
            onViewAll={() => router.push('/products')}
          />

          <Pressable style={[styles.seeMoreButton, { borderColor: palette.border }]} onPress={() => router.push('/products')}>
            <ThemedText style={styles.seeMoreText}>See more products</ThemedText>
          </Pressable>

          <TestimonialsSection
            testimonials={testimonials}
            width={testimonialWidth}
            palette={{ accent: palette.accent }}
            isDark={isDark}
          />

          <LatestArrivals
            products={products}
            palette={{ accent: palette.accent, border: palette.border, card: palette.card, muted: palette.muted }}
            isDark={isDark}
            onAdd={(product) => addItem({ ...product, variantId: null, variantLabel: undefined })}
            onPressProduct={(id) => router.push(`/product/${id}`)}
          />

          <DeliverySection palette={{ accent: palette.accent, border: palette.border, card: palette.card, muted: palette.muted }} />

          <FooterSection
            palette={{ card: palette.card, border: palette.border, muted: palette.muted, accent: palette.accent }}
            textColor={textColor}
            logoUrl={generalLogo}
            shopName={generalInfo?.shop_name}
            topBarSlogan={generalInfo?.top_bar_slogan}
            contactPhone={generalPhone}
            contactEmail={undefined}
            address={undefined}
            whatsapp="01712508063"
          />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 24,
    paddingBottom: 48,
  },
  navBar: {
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navTitle: {
    fontSize: 22,
    letterSpacing: 0.5,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 76,
    height: 76,
  },
  profileButton: {
    padding: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  kicker: {
    letterSpacing: 2,
    fontSize: 14,
    marginBottom: 4,
  },
  subline: {
    marginTop: 8,
    lineHeight: 22,
  },
  heroRail: {
    gap: 12,
  },
  heroWrapper: {
    marginHorizontal: -24,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 0,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  testimonialCard: {
    borderWidth: 1,
    borderRadius: 0,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  testimonialQuote: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  testimonialName: {
    fontSize: 12,
    fontWeight: '600',
  },
  testimonialFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testimonialAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d9d9d9',
  },
  testimonialBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff22',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  testimonialBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f85606',
  },
  ratingRow: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f59e0b',
  },
  latestStack: {
    gap: 12,
  },
  latestCard: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  latestImage: {
    width: '100%',
    height: 200,
  },
  latestMeta: {
    padding: 14,
    gap: 8,
  },
  latestTitle: {
    fontWeight: '800',
    fontSize: 16,
  },
  latestPrice: {
    fontWeight: '700',
    fontSize: 14,
  },
  latestDescription: {
    fontSize: 12,
    lineHeight: 16,
    maxHeight: 16 * 3,
    overflow: 'hidden',
  },
  latestActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  latestPrimary: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  latestPrimaryText: {
    fontWeight: '700',
    fontSize: 13,
    color: '#ffffff',
  },
  latestGhost: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  latestGhostText: {
    fontWeight: '700',
    fontSize: 13,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    gap: 4,
  },
  viewAll: {
    fontWeight: '700',
    marginTop: 4,
  },
  sectionHint: {
    lineHeight: 20,
  },
  categoryRail: {
    gap: 10,
    paddingVertical: 6,
  },
  categoryText: {
    fontWeight: '600',
    fontSize: 13,
    color: '#ffffff',
    textAlign: 'center',
  },
  categoryCard: {
    width: 120,
    height: 90,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  productCard: {
    width: '47.5%',
    borderRadius: 0,
    borderWidth: 1,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  productMeta: {
    padding: 12,
    gap: 4,
  },
  productName: {
    fontWeight: '700',
    lineHeight: 17,
    fontSize: 13,
  },
  price: {
    fontWeight: '700',
    fontSize: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontWeight: '700',
    color: '#0f403a',
    fontSize: 10,
  },
  productBadge: {
    marginTop: 6,
    backgroundColor: '#eef8f3',
  },
  buttonRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  buyButton: {
    paddingHorizontal: 14,
    height: 36,
    borderWidth: 0,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyText: {
    fontWeight: '700',
    fontSize: 13,
  },
  seeMoreButton: {
    marginTop: 4,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 0,
    alignItems: 'center',
  },
  seeMoreText: {
    fontWeight: '700',
    fontSize: 13,
  },
  aboutCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  aboutTitle: {
    fontWeight: '800',
    fontSize: 16,
  },
  aboutBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  aboutButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  aboutButtonText: {
    fontWeight: '700',
    color: '#ffffff',
  },
  footer: {
    padding: 18,
    borderRadius: 0,
    borderWidth: 1,
    gap: 12,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  ctaGhost: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
  },
  footerMeta: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 12,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
});
