// app/_layout.tsx
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";

// Redux
import { Provider } from "react-redux";
import { store } from "../store";

// Auth
import { AuthGuard } from "../components/AuthGuard";

// Empêche le splash de disparaître avant le chargement des fonts
SplashScreen.preventAutoHideAsync();

// Expo-router : config initiale
export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Gestion des erreurs expo-router
export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Gestion des erreurs de fonts
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Quand les fonts sont prêtes, on masque le splash
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Provider store={store}>
      <AuthGuard>
        <RootLayoutNav />
      </AuthGuard>
    </Provider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth */}
        <Stack.Screen name="auth" />

        {/* Tabs principaux */}
        <Stack.Screen name="(tabs)" />

        {/* Détails annonces */}
        <Stack.Screen
          name="announcement/[id]"
          options={{
            title: "Détail de l'annonce",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="announcement/edit/[id]"
          options={{
            title: "Modification de l'annonce",
            presentation: "modal",
          }}
        />

        {/* Matches */}
        <Stack.Screen
          name="matches/[id]"
          options={{
            title: "Correspondances",
            presentation: "modal",
          }}
        />

        {/* Chat */}
        <Stack.Screen
          name="chat"
          options={{
            title: "Discussion",
            presentation: "modal",
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
