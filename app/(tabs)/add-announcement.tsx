import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  SafeAreaView,
  Button
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { apiService } from '../../services/api';
import { Category, CreateAnnouncementData, mapFormToPostAddingDTO, Critere, CritereValue } from '../../types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import ImagePickerField from '@/components/imagePickerField';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const announcementSchema = yup.object().shape({
    titre_annonce: yup.string().required('Le titre est obligatoire'),
    description: yup.string().required('La description est obligatoire'),
    ville: yup.string().required('La ville est obligatoire'),
    codePostal: yup.string().required('Le code postal est obligatoire'),
    date: yup.string().required('La date est obligatoire'),
    categorieId: yup.number().typeError('Sélectionnez une catégorie valide').required('La catégorie est obligatoire'),
    type: yup.mixed<'perdu' | 'trouvé'>().oneOf(['perdu', 'trouvé']).required(),
    secretQuestion: yup.string()
                      .default('')
                      .when('type', {
                        is: 'trouvé',
                        then: (schema) => schema.required('La question secrète est obligatoire'),
                        otherwise: (schema) => schema.transform(() => '').default(''),
                      }),
    criteres: yup.array().of(yup.object().shape({
        id: yup.number().required('ID requis'),
        libelle: yup.string().required('Libellé requis'),
        type: yup.string().required('Type requis'),
        value: yup.string().required('Ce champ est obligatoire'),
      })
    )
    .required('Les critères sont requis'),
});

export default function AddAnnouncementScreen() {
  
  const params = useLocalSearchParams();
  const preselectedType = params.type as 'perdu' | 'trouvé';
  const dispatch = useAppDispatch();
  const { data: categories, loading, error } = useAppSelector(state => state.categories);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const methods = useForm<CreateAnnouncementData>({
    resolver: yupResolver(announcementSchema),
    defaultValues: {
      titre_annonce: '',
      description: '',
      ville: '',
      codePostal: '',
      date: new Date().toISOString().split('T')[0],
      categorieId: 0,
      type: preselectedType || 'perdu',
      secretQuestion: '',
      criteres: [],
    },
  });
  
  const { watch, setValue, handleSubmit, control, formState: { errors } } = methods;

  useEffect(() => {
    loadCategories();
  }, [dispatch]);
  
  useEffect(() => {
    const categorySelected = categories.find((c) => c.id === watch('categorieId')) || null;
    setSelectedCategory(categorySelected);
    // Reset criteria values when category changes
    if (categorySelected) {
      const criteres = categorySelected.criteres.map((critere) => ({
        id: critere.id,
        libelle: critere.libelle,
        type: critere.type,
        value: '',
      }));
      setValue('criteres', criteres);
    }
  }, [watch('categorieId'), categories, setValue]);

  const loadCategories = async () => {
    try {
      dispatch(fetchCategories());
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les catégories');
    }
  };

  const handleCriteriaChange = (criterionId: number, newValue: string) => {
    const currentCriteres = watch('criteres') || [];
    const existingIndex = currentCriteres.findIndex((c) => c.id === criterionId);    
    if (existingIndex >= 0) {
      // Update existing criteria
      const updatedCriteres = [...currentCriteres];
      updatedCriteres[existingIndex] = {
        ...updatedCriteres[existingIndex],
        value: newValue,
      };
      setValue('criteres', updatedCriteres);
    } else {
      // Add new criteria
      const criterion = selectedCategory?.criteres.find(c => c.id === criterionId);
      if (criterion) {
        const newCritere: CritereValue = {
          id: criterionId,
          libelle: criterion.libelle,
          type: criterion.type,
          value: newValue,
        };
        setValue('criteres', [...currentCriteres, newCritere]);
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {      
      // 1. Créer l'annonce sans l'image
      const payload = mapFormToPostAddingDTO(data ) as any;
      const res = await apiService.createAnnouncement(payload);
      const announcement = res.data;
      const id = announcement.id as number;
      // 2. Si une image existe → upload séparé
      if (data.image) {
      //console.log("Payload for announcement:", payload);
        const formData = new FormData();
        formData.append("image", {
          uri: data.image.uri || data.imagePreview, // chemin de l'image
          name: data.image._data?.name || "photo.jpg",
          type: data.image._data?.type || "image/jpeg",
        } as any);

        await apiService.uploadAnnouncementPhoto(id, formData);
      }
      // 3. Succès
      Alert.alert("Succès", "Votre annonce a été publiée avec succès !", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error creating announcement:", error);
      Alert.alert("Erreur", "Impossible de publier l'annonce");
    }
  };  



  /*const onSubmit = async (data:any) => {
    try {
      console.log('Submitting announcement:', data.image);
      await apiService.createAnnouncement(data);
      Alert.alert(
        'Succès', 
        'Votre annonce a été publiée avec succès !',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de publier l\'annonce');
      console.error('Error creating announcement:', error);
    } 
  };*/

  const renderCriteriaInput = (criterion: Critere) => {
    const currentCriteres = watch('criteres') || [];
    const selectedCritere = currentCriteres.find(c => c.id === criterion.id);
    const selectedValue = selectedCritere?.value ?? '';

    switch (criterion.type) {
      case 'select':
        return (
          <View key={criterion.id} style={styles.inputGroup}>
            <Text style={styles.label}>
              {criterion.libelle} <Text style={styles.required}> *</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedValue}
                onValueChange={(value) => handleCriteriaChange(criterion.id, value)}
                style={styles.picker}
              >
                <Picker.Item label={`Sélectionner ${criterion.libelle.toLowerCase()}`} value="" />
                {criterion.options?.map((option: string) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>
        );

      case 'text':
      case 'number':
        return (
          <View key={criterion.id} style={styles.inputGroup}>
            <Text style={styles.label}>
              {criterion.libelle}
              {criterion.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={styles.textInput}
              value={selectedValue}
              onChangeText={(text) => handleCriteriaChange(criterion.id, text)}
              placeholder={`Entrer ${criterion.libelle.toLowerCase()}`}
              keyboardType={criterion.type === 'number' ? 'numeric' : 'default'}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nouvelle annonce</Text>
        <Text style={styles.subtitle}>
          {watch('type') === 'perdu' ? 'Objet perdu' : 'Objet trouvé'}
        </Text>
      </View>

      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            watch('type') === 'perdu' && styles.typeButtonLostActive,
          ]}
          onPress={() => setValue('type', 'perdu')}
        >
          <FontAwesome 
            name="search" 
            size={20} 
            color={watch('type') === 'perdu' ? 'white' : '#666'} 
          />
          <Text style={[
            styles.typeButtonText,
            watch('type') === 'perdu' && styles.typeButtonTextActive,
          ]}>
            Perdu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            watch('type') === 'trouvé' && styles.typeButtonFoundActive,
          ]}
          onPress={() => setValue('type', 'trouvé')}
        >
          <FontAwesome 
            name="check" 
            size={20} 
            color={watch('type') === 'trouvé' ? 'white' : '#666'} 
          />
          <Text style={[
            styles.typeButtonText,
            watch('type') === 'trouvé' && styles.typeButtonTextActive,
          ]}>
            Trouvé
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Titre <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="titre_annonce"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.textInput}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Ex: iPhone 13 Pro perdu"
                  maxLength={100}
                />
              )}
            />
            {errors.titre_annonce && (
              <Text style={styles.errorText}>{errors.titre_annonce.message}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Décrivez l'objet en détail..."
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
              )}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description.message}</Text>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>
                Ville <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="ville"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Ex: Bruxelles"
                  />
                )}
              />
              {errors.ville && (
                <Text style={styles.errorText}>{errors.ville.message}</Text>
              )}
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>
                Code postal <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="codePostal"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Ex: 1000"
                    keyboardType="numeric"
                    maxLength={10}
                  />
                )}
              />
              {errors.codePostal && (
                <Text style={styles.errorText}>{errors.codePostal.message}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Date <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.textInput}
                  value={value}
                  onChangeText={onChange}
                  placeholder="YYYY-MM-DD"
                />
              )}
            />
            {errors.date && (
              <Text style={styles.errorText}>{errors.date.message}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Catégorie <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Controller
                control={control}
                name="categorieId"
                render={({ field: { onChange, value } }) => (
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={styles.picker}
                  >
                    <Picker.Item label="Sélectionner une catégorie" value={0} />
                    {categories.map((category) => (
                      <Picker.Item
                        key={category.id}
                        label={category.libelle}
                        value={category.id}
                      />
                    ))}
                  </Picker>
                )}
              />
            </View>
            {errors.categorieId && (
              <Text style={styles.errorText}>{errors.categorieId.message}</Text>
            )}
          </View>

          {selectedCategory?.criteres.map(renderCriteriaInput)}

          {watch('type') === 'trouvé' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Question secrète <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="secretQuestion"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Ex: quel est le nom marqué sur l'objet ?"
                    maxLength={200}
                  />
                )}
              />
              {errors.secretQuestion && (
                <Text style={styles.errorText}>{errors.secretQuestion.message}</Text>
              )}
              <Text style={styles.hint}>
                Cette question sera posée à la personne qui prétend avoir perdu l'objet
              </Text>
            </View>
          )}

          <FormProvider {...methods}>
            <ImagePickerField control={control} />
          </FormProvider>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Publication...' : 'Publier l\'annonce'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  typeSelector: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#eee',
    gap: 8,
  },
  typeButtonLostActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  typeButtonFoundActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF6B6B',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  flex1: {
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 5,
  },
  photoButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  photoPlaceholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});