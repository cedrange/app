import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setLoading,
  loginSuccess, 
  loginFailure, 
  logout as logoutAction, 
  restoreAuth,
  clearAuth
} from '../store/slices/authSlice';
import { 
  useLoginMutation, 
  useSignupMutation, 
  useSocialAuthMutation, 
  useLogoutMutation 
} from '../services/authApi';
import { LoginRequest, SignupRequest, User } from '../types';
import { secureStorage } from '../utils/storage';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, accesToken, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  
  const [loginMutation] = useLoginMutation();
  const [signupMutation] = useSignupMutation();
  const [socialAuthMutation] = useSocialAuthMutation();
  const [logoutMutation] = useLogoutMutation();

  // Configuration Google
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  // Configuration Facebook
  const [facebookRequest, facebookResponse, facebookPromptAsync] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_ID!,
  });

  // Restaurer l'authentification au démarrage
  /*useEffect(() => {
    const restoreAuthState = async () => {
      try {
        dispatch(setLoading(true));
        
        const storedToken = await secureStorage.getAuthToken();
        const storedUser = await secureStorage.getUserData();
        
        if (storedToken && storedUser) {
          console.log('🔄 Restauration de l\'authentification:', { storedUser, storedToken });
          dispatch(restoreAuth({ user: storedUser, token: storedToken }));
        } else {
          console.log('❌ Aucune authentification stockée trouvée');
          dispatch(setLoading(false));
        }
      } catch (error) {
        console.error('❌ Erreur lors de la restauration de l\'authentification:', error);
        dispatch(clearAuth());
      }
    };

    restoreAuthState();
  }, [dispatch]);*/

  // Gérer les réponses Google
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      handleSocialAuth('google', googleResponse.authentication?.accessToken);
    }
  }, [googleResponse]);

  // Gérer les réponses Facebook
  useEffect(() => {
    if (facebookResponse?.type === 'success') {
      handleSocialAuth('facebook', facebookResponse.authentication?.accessToken);
    }
  }, [facebookResponse]);

  const login = async (credentials: LoginRequest) => {
    try {
      console.log('🔐 Tentative de connexion pour:', credentials.email);
      
      const response = await loginMutation(credentials).unwrap();
      
      console.log('✅ Réponse de connexion reçue:', response);
      
      // Sauvegarder les données
      await secureStorage.setAuthToken(response.accesToken);
      await secureStorage.setUserData(response.user);
      
      // Le state sera mis à jour automatiquement via extraReducers
      console.log('💾 Données sauvegardées avec succès');
      
      return response;
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error);
      dispatch(loginFailure());
      throw error;
    }
  };

  const signup = async (userData: SignupRequest) => {
    try {
      console.log('📝 Tentative d\'inscription pour:', userData.email);
      
      const response = await signupMutation(userData).unwrap();
      
      console.log('✅ Réponse d\'inscription reçue:', response);
      
      // Sauvegarder les données
      await secureStorage.setAuthToken(response.accesToken);
      await secureStorage.setUserData(response.user);
      
      console.log('💾 Données sauvegardées avec succès');
      
      return response;
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', error);
      dispatch(loginFailure());
      throw error;
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook', accessToken?: string) => {
    if (!accessToken) {
      console.error('❌ Token d\'accès manquant pour', provider);
      return;
    }
    
    try {
      console.log('🔗 Tentative d\'authentification sociale avec:', provider);
      
      const response = await socialAuthMutation({
        provider,
        token: accessToken,
      }).unwrap();
      
      console.log('✅ Réponse d\'authentification sociale reçue:', response);
      
      // Sauvegarder les données
      await secureStorage.setAuthToken(response.accesToken);
      await secureStorage.setUserData(response.user);
      
      console.log('💾 Données sauvegardées avec succès');
      
      return response;
    } catch (error: any) {
      console.error('❌ Erreur d\'authentification sociale:', error);
      dispatch(loginFailure());
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Déconnexion en cours...');
      
      // Appeler l'API de déconnexion
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('❌ Erreur lors de l\'appel API de déconnexion:', error);
    } finally {
      // Nettoyer les données locales dans tous les cas
      await secureStorage.clearAll();
      dispatch(logoutAction());
      console.log('✅ Déconnexion terminée');
    }
  };

  const loginWithGoogle = () => {
    console.log('🔍 Lancement de l\'authentification Google...');
    googlePromptAsync();
  };

  const loginWithFacebook = () => {
    console.log('📘 Lancement de l\'authentification Facebook...');
    facebookPromptAsync();
  };

  // Debug: Afficher le state actuel
  /*useEffect(() => {
    console.log('🔍 État d\'authentification:', {
      user: user ? `${user.firstName} ${user.lastName} (${user.email})` : null,
      token: token ? `${token.substring(0, 10)}...` : null,
      isAuthenticated,
      isLoading,
    });
  }, [user, token, isAuthenticated, isLoading]);*/

  return {
    user,
    accesToken,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    loginWithGoogle,
    loginWithFacebook,
    googleRequest,
    facebookRequest,
  };
};