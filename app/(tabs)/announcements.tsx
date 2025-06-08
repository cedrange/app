import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { apiService } from '../../services/api';
import { Announcement, User } from '../../types';
import AnnouncementCard from '../../components/AnnouncementCard';
import FilterModal from '../../components/FilterModal';

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<{
    type?: 'LOST' | 'FOUND';
    city?: string;
    categoryId?: string;
  }>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [filters]);

  const loadData = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      await loadAnnouncements();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const data = await apiService.getAnnouncements(filters);
      setAnnouncements(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les annonces');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof typeof filters];
    setFilters(newFilters);
  };

  const renderAnnouncement = ({ item }: { item: Announcement }) => (
    <AnnouncementCard
      announcement={item}
      onPress={() => router.push(`/announcement/${item.id}`)}
      currentUserId={user?.id}
      showMatchButton={true}
    />
  );

  const hasActiveFilters = Object.keys(filters).length > 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Toutes les annonces</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <FontAwesome 
            name="filter" 
            size={24} 
            color={hasActiveFilters ? "#007AFF" : "#666"} 
          />
          <Text style={[styles.filterText, hasActiveFilters && styles.filterTextActive]}>
            Filtrer
          </Text>
        </TouchableOpacity>
      </View>

      {hasActiveFilters && (
        <View style={styles.activeFilters}>
          <Text style={styles.activeFiltersText}>Filtres actifs:</Text>
          <View style={styles.filterChips}>
            {filters.type && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  {filters.type === 'LOST' ? 'Perdu' : 'Trouvé'}
                </Text>
                <TouchableOpacity onPress={() => clearFilter('type')}>
                  <FontAwesome name="times" size={14} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            {filters.city && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>{filters.city}</Text>
                <TouchableOpacity onPress={() => clearFilter('city')}>
                  <FontAwesome name="times" size={14} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            {filters.categoryId && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>Catégorie</Text>
                <TouchableOpacity onPress={() => clearFilter('categoryId')}>
                  <FontAwesome name="times" size={14} color="#666" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      <FlatList
        data={announcements}
        renderItem={renderAnnouncement}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="search" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Aucune annonce trouvée</Text>
            <Text style={styles.emptySubtext}>
              {hasActiveFilters ? 'Essayez de modifier vos filtres' : 'Soyez le premier à publier une annonce !'}
            </Text>
          </View>
        }
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  filterText: {
    color: '#666',
    fontSize: 16,
  },
  filterTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  activeFilters: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activeFiltersText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f3ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 5,
  },
  filterChipText: {
    fontSize: 12,
    color: '#007AFF',
  },
  listContainer: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
    textAlign: 'center',
  },
});