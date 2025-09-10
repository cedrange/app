import * as ImagePicker from 'expo-image-picker'
import { Alert } from 'react-native'
import { useFormContext } from 'react-hook-form'

const useImagePicker = () => {
  const { setValue } = useFormContext()

  const handleImagePick = async () => {
    // Demander la permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permissionResult.granted) {
      Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la galerie photos')
      return
    }

    // Ouvrir la galerie
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: false,
    })

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0]

      // Créer un blob à partir de l’URI
      const response = await fetch(asset.uri)
      const blob = await response.blob()

      // Préparer un fichier pour FormData
      const file = new File([blob], 'image.jpg', { type: blob.type })

      // Mettre à jour les valeurs du formulaire
      setValue('image', file, { shouldValidate: true })

      // Optionnel : pour l’aperçu
      setValue('imagePreview', asset.uri)
    }
  }

  return { handleImagePick }
}

export default useImagePicker
