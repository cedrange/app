import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useSegments } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inProtectedGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inProtectedGroup) {
      // Rediriger vers l'écran de connexion si pas authentifié
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Rediriger vers l'app si déjà authentifié
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
