import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function Index() {
  const { isLoading, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Ne rien faire tant que l'état auth est en loading
  useEffect(() => {
    if (isLoading) return; // attend la fin du chargement
    if (isAuthenticated) {
      // Remplace l'écran seulement si l'utilisateur est authentifié
      console.log('User is authenticated, navigating to main app');      
      router.replace('/(tabs)');
    } else {
      router.replace('/auth/login');
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#06090cff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
