import { useEffect, useState, createContext, useContext } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { LeftNavigation } from '@/components/LeftNavigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { initConsoleFiltering } from '@/utils/consoleUtils';
import { router, usePathname } from 'expo-router';
import { Platform } from 'react-native';

// Navigation Context
interface NavigationContextType {
  isNavigationVisible: boolean;
  openNavigation: () => void;
  closeNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const { isDark } = useTheme();
  const [isNavigationVisible, setIsNavigationVisible] = useState(false);
  const pathname = usePathname();

  const navigationValue = {
    isNavigationVisible,
    openNavigation: () => setIsNavigationVisible(true),
    closeNavigation: () => setIsNavigationVisible(false),
  };

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Only replace route if not already on a tab route
        if (!pathname.includes('/(tabs)')) {
          router.replace('/(tabs)');
        }
      } else {
        // Only replace route if not already on auth route
        if (!pathname.includes('/(auth)')) {
          router.replace('/(auth)/signin');
        }
      }
    }
  }, [user, loading, pathname]);

  if (loading) {
    return null;
  }

  return (
    <NavigationContext.Provider value={navigationValue}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      
      {/* Left Navigation - Only show when user is authenticated */}
      {user && (
        <LeftNavigation
          isVisible={isNavigationVisible}
          onClose={() => setIsNavigationVisible(false)}
          currentRoute={pathname}
        />
      )}
    </NavigationContext.Provider>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  
  // Initialize console filtering in development
  useEffect(() => {
    if (__DEV__) {
      initConsoleFiltering();
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
          <StatusBar style="dark" backgroundColor="#ffffff" />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}