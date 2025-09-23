export default {
  expo: {
    name: 'Efinder',
    slug: 'efinder-expo-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.yourcompany.authexpoapp',
      config: {
        googleSignIn: {
          reservedClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        },
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
      package: 'com.yourcompany.authexpoapp',
      //googleServicesFile: './google-services.json',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    scheme: 'authexpoapp',
    plugins: [
      'expo-router',
      'expo-secure-store',
      [
        'expo-image-picker',
        {
          photosPermission: 'L\'application accède à vos photos pour vous permettre de définir une photo de profil.',
        },
      ],
    ],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      facebookClientId: process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_ID,
    },
  },
};