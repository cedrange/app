// services/tokenService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export const tokenService = {
  getToken: async () => {
    return await AsyncStorage.getItem("token");
  },
  setToken: async (token: string) => {
    console.log("la reponse du serveur pour le login tokenService.ts: ",token);
    await AsyncStorage.setItem("token", token);
  },
  clearToken: async () => {
    await AsyncStorage.removeItem("token");
  },
};
