import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';

export default function ProfileIndexScreen() {
  const { user } = useAuth();

  useEffect(() => {
    // Rediriger automatiquement vers le profil de l'utilisateur connecté
    if (user?.id) {
      router.replace(`/(tabs)/profile/${user.id}`);
    }
  }, [user]);

  return null;
}