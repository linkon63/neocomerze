import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';

type Props = {
  accent: string;
  onProfilePress: () => void;
};

export function NavBar({ accent, onProfilePress }: Props) {
  return (
    <View style={styles.navBar}>
      <View style={styles.logoRow}>
        <Image source={require('../../public/jannat.png')} style={styles.logo} contentFit="contain" />
        {/* <ThemedText type="title" style={styles.navTitle}>Shopping করুন আমাদের সাথে</ThemedText> */}
      </View>
      <Pressable style={styles.profileButton} onPress={onProfilePress}>
        <IconSymbol name="person.crop.circle" color={accent} size={26} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  navTitle: {
    fontSize: 22,
    letterSpacing: 0.5,
  },
  profileButton: {
    padding: 6,
  },
});
