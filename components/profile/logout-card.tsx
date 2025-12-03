import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type LogoutCardProps = {
  onLogout: () => void;
};

export function LogoutCard({ onLogout }: LogoutCardProps) {
  return (
    <ThemedView style={styles.card}>
      <View style={styles.header}>
        <ThemedText style={styles.heading}>Ready to sign out?</ThemedText>
        <ThemedText style={styles.caption}>
          We will keep your cart safe. Sign back in anytime to continue shopping.
        </ThemedText>
      </View>

      <Pressable onPress={onLogout} style={styles.logoutButton}>
        <ThemedText style={styles.logoutText}>Logout</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#fff4ec',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fde7d8',
    gap: 12,
  },
  header: {
    gap: 6,
  },
  heading: {
    fontWeight: '800',
    fontSize: 18,
    color: '#9a3412',
  },
  caption: {
    color: '#9a3412',
    fontSize: 13,
    lineHeight: 18,
  },
  logoutButton: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
});
