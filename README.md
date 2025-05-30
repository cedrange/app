# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


app/
├── (tabs)/
│   ├── index.tsx              # Écran d'accueil
│   ├── announcements.tsx      # Liste des annonces
│   ├── add-announcement.tsx   # Ajouter une annonce
│   └── profile.tsx           # Profil utilisateur
├── announcement/
│   └── [id].tsx              # Détail d'une annonce
├── matches/
│   └── [id].tsx              # Matches pour une annonce
├── chat/
│   └── [matchId].tsx         # Chat entre utilisateurs
├── _layout.tsx               # Layout principal
└── +not-found.tsx           # Page 404

components/
├── AnnouncementCard.tsx
├── AnnouncementForm.tsx
├── FilterModal.tsx
└── ChatScreen.tsx

constants/
└── index.ts

types/
└── index.ts

services/
└── api.ts

## Instructions de démarrage

```bash

# 1. Installer les dépendances supplémentaires
npx expo install expo-image-picker expo-location axios
npm install react-native-gifted-chat @react-native-picker/picker

# 2. Remplacer les fichiers par le code ci-dessus

# 3. Démarrer l'application
npx expo start

# 4. Pour tester sur un appareil physique
npx expo start --tunnel

# 5. Pour démarrer le serveur backend (Spring Boot)
# Assurez-vous que votre API Spring Boot fonctionne sur http://localhost:5000/v1/
```

## Fonctionnalités implémentées

✅ **Navigation avec Expo Router** - Structure moderne avec onglets et navigation en pile
✅ **Gestion des rôles** - USER, ADMIN, PROFESSIONAL, SUPERADMIN
✅ **CRUD des annonces** - Créer, lire, modifier, supprimer
✅ **Système de filtres** - Par type, ville, catégorie
✅ **Catégories dynamiques** - Avec critères configurables
✅ **Upload d'images** - Avec expo-image-picker
✅ **Système de matching** - Correspondances automatiques
✅ **Chat instantané** - Communication entre utilisateurs
✅ **Questions secrètes** - Pour les objets trouvés
✅ **Interface responsive** - Design moderne et accessible
✅ **Mock API** - Fonctionne sans backend pour développement

L'application est maintenant structurée selon les dernières conventions d'Expo Router et prête à être connectée à votre API Spring Boot !
