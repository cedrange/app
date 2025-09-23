// Composant temporaire pour debugger
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useAppSelector } from '../store/hooks';
import { secureStorage } from '../utils/storage';

export const DebugAuth: React.FC = () => {
  const auth = useAuth();
  const stateAuth = useAppSelector((state) => state.auth);

  const checkStoredData = async () => {
    try {
      const token = await secureStorage.getAuthToken();
      const userData = await secureStorage.getUserData();
      
      Alert.alert('Données stockées', JSON.stringify({
        token: token ? `${token.substring(0, 20)}...` : 'null',
        user: userData ? `${userData.firstName} ${userData.lastName}` : 'null'
      }, null, 2));
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de lire les données stockées');
    }
  };

  const clearStoredData = async () => {
    try {
      await secureStorage.clearAll();
      Alert.alert('Succès', 'Données stockées supprimées');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer les données');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Authentification</Text>
      
      <Text style={styles.section}>Hook useAuth:</Text>
      <Text style={styles.text}>User: {auth.user ? `${auth.user.firstName} ${auth.user.lastName}` : 'null'}</Text>
      <Text style={styles.text}>Token: {auth.token ? 'Présent' : 'null'}</Text>
      <Text style={styles.text}>IsAuthenticated: {auth.isAuthenticated.toString()}</Text>
      <Text style={styles.text}>IsLoading: {auth.isLoading.toString()}</Text>
      
      <Text style={styles.section}>Redux State:</Text>
      <Text style={styles.text}>User: {stateAuth.user ? `${stateAuth.user.firstName} ${stateAuth.user.lastName}` : 'null'}</Text>
      <Text style={styles.text}>Token: {stateAuth.token ? 'Présent' : 'null'}</Text>
      <Text style={styles.text}>IsAuthenticated: {stateAuth.isAuthenticated.toString()}</Text>
      <Text style={styles.text}>IsLoading: {stateAuth.isLoading.toString()}</Text>
      
      <TouchableOpacity style={styles.button} onPress={checkStoredData}>
        <Text style={styles.buttonText}>Vérifier données stockées</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={clearStoredData}>
        <Text style={styles.buttonText}>Supprimer données stockées</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={() => auth.logout()}>
        <Text style={styles.buttonText}>Forcer déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  section: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    color: '#666',
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
    color: '#444',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

// utils/apiResponseTransformer.ts - Transformer pour adapter la réponse de votre backend
export const transformAuthResponse = (backendResponse: any) => {
  // Si votre backend renvoie la structure directement
  if (backendResponse.user && backendResponse.token) {
    return backendResponse;
  }
  
  // Si votre backend renvoie dans un wrapper "data"
  if (backendResponse.data) {
    return {
      user: backendResponse.data.user || backendResponse.data,
      token: backendResponse.data.token || backendResponse.token,
    };
  }
  
  // Si l'utilisateur et le token sont au niveau racine
  if (backendResponse.id) {
    return {
      user: backendResponse,
      token: backendResponse.token || backendResponse.accessToken,
    };
  }
  
  // Logging pour debug
  console.error('⚠️ Structure de réponse inattendue:', backendResponse);
  
  throw new Error('Structure de réponse API invalide');
};

// Test avec votre structure exacte Spring Boot
export const testSpringBootResponse = () => {
  // Exemple de ce que votre Spring Boot pourrait retourner
  const mockSpringBootResponse = {
    success: true,
    data: {
      id: 1,
      email: "user@example.com",
      firstName: "John",
      lastName: "Doe",
      // ... autres propriétés
    },
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    message: "Login successful"
  };
  
  try {
    const transformed = transformAuthResponse(mockSpringBootResponse);
    console.log('✅ Transformation réussie:', transformed);
    return transformed;
  } catch (error) {
    console.error('❌ Erreur de transformation:', error);
    return null;
  }
};