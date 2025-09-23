// app/auth/login.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { DebugAuth } from '@/components/DebugAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const {user, login, loginWithGoogle, loginWithFacebook, isLoading } = useAuth();
  const [showDebug, setShowDebug] = useState(__DEV__); // Montrer en mode dev seulement

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      console.log('🚀 Début de la connexion...');
      const result = await login({ email: email.toLowerCase().trim(), password });
      console.log('✅ Connexion réussie, résultat:', result);
      
      // Attendre un moment pour que le state se mette à jour
      setTimeout(() => {
        if (result && result.user) {
          console.log('🏠 Redirection vers les onglets...');
          router.replace('/(tabs)');
        } else {
          console.warn('⚠️ Pas d\'utilisateur dans le résultat');
        }
      }, 100);
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error);
      Alert.alert(
        'Erreur de connexion',
        error?.data?.message || error?.message || 'Email ou mot de passe incorrect'
      );
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la connexion avec Google');
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await loginWithFacebook();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la connexion avec Facebook');
    }
  };

  // Si l'utilisateur est déjà connecté, rediriger
  React.useEffect(() => {
    if (user && !isLoading) {
      console.log('👤 Utilisateur déjà connecté, redirection...');
      router.replace('/(tabs)');
    }
  }, [user, isLoading]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={handleFacebookLogin}>
              <Ionicons name="logo-facebook" size={20} color="#4267B2" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Pas encore de compte ?{' '}
            <Link href="/auth/signup" style={styles.link}>
              S'inscrire
            </Link>
          </Text>
          <Link href="/auth/forgot-password" style={styles.forgotPassword}>
            Mot de passe oublié ?
          </Link>
          {__DEV__ && (
            <TouchableOpacity 
              style={styles.debugToggle}
              onPress={() => setShowDebug(!showDebug)}
            >
              <Text style={styles.debugToggleText}>
                {showDebug ? 'Masquer' : 'Afficher'} debug
              </Text>
            </TouchableOpacity>)}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1a1a1a',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  link: {
    color: '#007AFF',
    fontWeight: '600',
  },
  forgotPassword: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  debugToggle: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  debugToggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});