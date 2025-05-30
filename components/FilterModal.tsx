import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import { apiService } from '../services/api';
import { Category } from '../types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  currentFilters: any;
}

export default function FilterModal({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}: FilterModalProps) {
  const [type, setType] = useState<'LOST' | 'FOUND' | ''>('');
  const [city, setCity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (visible) {
      loadCategories();
      // Initialize with current filters
      setType(currentFilters.type || '');
      setCity(currentFilters.city || '');
      setCategoryId(currentFilters.categoryId || '');
    }
  }, [visible, currentFilters]);

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleApply = () => {
    const filters: any = {};
    if (type) filters.type = type;
    if (city.trim()) filters.city = city.trim();
    if (categoryId) filters.categoryId = categoryId;
    
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setType('');
    setCity('');
    setCategoryId('');
    onApplyFilters({});
    onClose();
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <FontAwesome name="times" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Filtres</Text>
          <TouchableOpacity onPress={handleReset} style={styles.headerButton}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type d'annonce</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'LOST' && styles.typeButtonActive,
                  type === 'LOST' && styles.typeButtonLost,
                ]}
                onPress={() => setType(type === 'LOST' ? '' : 'LOST')}
              >
                <FontAwesome 
                  name="search" 
                  size={20} 
                  color={type === 'LOST' ? 'white' : '#FF6B6B'} 
                />
                <Text style={[
                  styles.typeButtonText,
                  type === 'LOST' && styles.typeButtonTextActive
                ]}>
                  Perdu
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'FOUND' && styles.typeButtonActive,
                  type === 'FOUND' && styles.typeButtonFound,
                ]}
                onPress={() => setType(type === 'FOUND' ? '' : 'FOUND')}
              >
                <FontAwesome 
                  name="check-circle" 
                  size={20} 
                  color={type === 'FOUND' ? 'white' : '#4ECDC4'} 
                />
                <Text style={[
                  styles.typeButtonText,
                  type === 'FOUND' && styles.typeButtonTextActive
                ]}>
                  Trouvé
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ville</Text>
            <TextInput
              style={styles.textInput}
              value={city}
              onChangeText={setCity}
              placeholder="Entrez une ville"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catégorie</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={categoryId}
                onValueChange={setCategoryId}
                style={styles.picker}
              >
                <Picker.Item label="Toutes les catégories" value="" />
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
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Appliquer les filtres</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerButton: {
    width: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  resetText: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  typeButtons: {
    flexDirection: 'row',
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
  typeButtonActive: {
    borderColor: 'transparent',
  },
  typeButtonLost: {
    backgroundColor: '#FF6B6B',
  },
  typeButtonFound: {
    backgroundColor: '#4ECDC4',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
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
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});