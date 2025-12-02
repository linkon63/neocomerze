import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';

import { HeroSlide } from './types';

type Props = {
  slides: HeroSlide[];
  heroWidth: number;
  heroHeight: number;
  borderColor: string;
  horizontalGutter: number;
};

export function HeroCarousel({
  slides,
  heroWidth,
  heroHeight,
  borderColor,
  horizontalGutter,
}: Props) {
  return (
    <View style={styles.heroWrapper}>
      <ScrollView
        horizontal
        pagingEnabled
        snapToInterval={heroWidth + 12}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.heroRail, { paddingHorizontal: horizontalGutter }]}>
        {slides.map((slide) => (
          <View
            key={slide.id}
            style={[
              styles.heroCard,
              {
                width: heroWidth,
                height: heroHeight,
                backgroundColor: slide.tone,
                borderColor,
              },
            ]}>
            <Image source={slide.image} style={styles.heroImage} contentFit="cover" />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
