import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { useFormContext } from 'react-hook-form';

const useImagePicker = () => {
  const { setValue } = useFormContext();

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission requise', "Veuillez autoriser l'accès à la galerie photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true, // important : on récupère le base64 pour { data: string }
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];

      // Mettre à jour le champ photo
      setValue('photo', { data: asset.base64 }, { shouldValidate: true });

      // Optionnel : pour l’aperçu immédiat
      setValue('imagePreview', `data:image/png;base64,${asset.base64}`);
    }
  };

  return { handleImagePick };
};

export default useImagePicker;
