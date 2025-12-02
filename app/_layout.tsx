import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { StyleSheet, View, Text } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { CartProvider } from '@/context/cart-context';
import { useCart } from '@/context/cart-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <CartProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <ToastBanner />
        </View>
        <StatusBar style="auto" />
      </ThemeProvider>
    </CartProvider>
  );
}

function ToastBanner() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.toast,
        { backgroundColor: isDark ? '#1f252f' : '#1f2933', borderColor: isDark ? '#2e3a48' : '#2f3b4a' },
      ]}>
      <Text style={styles.toastText}>{toastMessage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  toastText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
