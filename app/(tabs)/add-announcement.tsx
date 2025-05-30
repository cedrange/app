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
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { apiService } from '../../services/api';
import { Category, CreateAnnouncementData } from '../../types';

export default function AddAnnouncementScreen() {
  const params = useLocalSearchParams();
  const preselectedType = params.type as 'LOST' | 'FOUND' | undefined;

  const [formData, setFormData] = useState<CreateAnnouncementData>({
    title: '',
    description: '',
    city: '',
    postalCode: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    type: preselectedType || 'LOST',
    photo: '',
    secretQuestion: '',
    criteriaValues: {},
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const category = categories.find(c => c.id === formData.categoryId);
    setSelectedCategory(category || null);
    // Reset criteria values when category changes
    if (category) {
      const newCriteriaValues: { [key: string]: string } = {};
      category.criteria.forEach(criterion => {
        newCriteriaValues[criterion.id] = '';
      });
      setFormData(prev => ({ ...prev, criteriaValues: newCriteriaValues }));
    }
  }, [formData.categoryId, categories]);

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les catégories');
    }
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la galerie photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData(prev => ({ ...prev, photo: result.assets[0].uri }));
    }
  };

  const handleCriteriaChange = (criterionId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      criteriaValues: {
        ...prev.criteriaValues,
        [criterionId]: value,
      },
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Erreur', 'La description est obligatoire');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Erreur', 'La ville est obligatoire');
      return false;
    }
    if (!formData.postalCode.trim()) {
      Alert.alert('Erreur', 'Le code postal est obligatoire');
      return false;
    }
    if (!formData.categoryId) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return false;
    }

    // Validate required criteria
    if (selectedCategory) {
      for (const criterion of selectedCategory.criteria) {
        if (criterion.required && !formData.criteriaValues[criterion.id]?.trim()) {
          Alert.alert('Erreur', `Le champ "${criterion.name}" est obligatoire`);
          return false;
        }
      }
    }

    // Validate secret question for FOUND items
    if (formData.type === 'FOUND' && !formData.secretQuestion?.trim()) {
      Alert.alert('Erreur', 'La question secrète est obligatoire pour les objets trouvés');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await apiService.createAnnouncement(formData);
      Alert.alert(
        'Succès', 
        'Votre annonce a été publiée avec succès !',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de publier l\'annonce');
      console.error('Error creating announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCriteriaInput = (criterion: any) => {
    switch (criterion.type) {
      case 'select':
        return (
          <View key={criterion.id} style={styles.inputGroup}>
            <Text style={styles.label}>
              {criterion.name}
              {criterion.required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.criteriaValues[criterion.id] || ''}
                onValueChange={(value) => handleCriteriaChange(criterion.id, value)}
                style={styles.picker}
              >
                <Picker.Item label={`Sélectionner ${criterion.name.toLowerCase()}`} value="" />
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
              {criterion.name}
              {criterion.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={styles.textInput}
              value={formData.criteriaValues[criterion.id] || ''}
              onChangeText={(value) => handleCriteriaChange(criterion.id, value)}
              placeholder={`Entrer ${criterion.name.toLowerCase()}`}
              keyboardType={criterion.type === 'number' ? 'numeric' : 'default'}
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
          {formData.type === 'LOST' ? 'Objet perdu' : 'Objet trouvé'}
        </Text>
      </View>

      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            formData.type === 'LOST' && styles.typeButtonLostActive,
          ]}
          onPress={() => setFormData(prev => ({ ...prev, type: 'LOST' }))}
        >
          <FontAwesome 
            name="search" 
            size={20} 
            color={formData.type === 'LOST' ? 'white' : '#666'} 
          />
          <Text style={[
            styles.typeButtonText,
            formData.type === 'LOST' && styles.typeButtonTextActive,
          ]}>
            Perdu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            formData.type === 'FOUND' && styles.typeButtonFoundActive,
          ]}
          onPress={() => setFormData(prev => ({ ...prev, type: 'FOUND' }))}
        >
          <FontAwesome 
            name="check" 
            size={20} 
            color={formData.type === 'FOUND' ? 'white' : '#666'} 
          />
          <Text style={[
            styles.typeButtonText,
            formData.type === 'FOUND' && styles.typeButtonTextActive,
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
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => setFormData(prev => ({ ...prev, title: value }))}
              placeholder="Ex: iPhone 13 Pro perdu"
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Décrivez l'objet en détail..."
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>
                Ville <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.city}
                onChangeText={(value) => setFormData(prev => ({ ...prev, city: value }))}
                placeholder="Bruxelles"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>
                Code postal <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.postalCode}
                onChangeText={(value) => setFormData(prev => ({ ...prev, postalCode: value }))}
                placeholder="1000"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Date <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              value={formData.date}
              onChangeText={(value) => setFormData(prev => ({ ...prev, date: value }))}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Catégorie <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.categoryId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                style={styles.picker}
              >
                <Picker.Item label="Sélectionner une catégorie" value="" />
                {categories.map((category) => (
                  <Picker.Item
                    key={category.id}
                    label={category.name}
                    value={category.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {selectedCategory && selectedCategory.criteria.map(renderCriteriaInput)}

          {formData.type === 'FOUND' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Question secrète <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.secretQuestion}
                onChangeText={(value) => setFormData(prev => ({ ...prev, secretQuestion: value }))}
                placeholder="Ex: Quelle est la couleur de la coque ?"
                maxLength={200}
              />
              <Text style={styles.hint}>
                Cette question sera posée à la personne qui prétend avoir perdu l'objet
              </Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Photo</Text>
            <TouchableOpacity style={styles.photoButton} onPress={handleImagePick}>
              {formData.photo ? (
                <Image source={{ uri: formData.photo }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <FontAwesome name="camera" size={40} color="#ccc" />
                  <Text style={styles.photoPlaceholderText}>Ajouter une photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
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