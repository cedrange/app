import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import { apiService } from '../../services/apiService';
import { Match, Announcement, User } from '../../types';
import AnnouncementCard from '../../components/AnnouncementCard';
import { useSelector } from 'react-redux';

export default function MatchesScreen() {
  const { id } = useLocalSearchParams();
  const [matches, setMatches] = useState<Match[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const {user} = useSelector((state: any) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      if (typeof id === 'string') {
        const [announcementData, matchesData] = await Promise.all([
          apiService.getAnnouncementById(Number(id)),
          apiService.getAnnouncementMatches(Number(id))
        ]);
        
        setAnnouncement(announcementData);
        setMatches(matchesData);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les correspondances');
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactUser = (match: Match) => {
    const matchId = match.id;
    router.push(`/chat/${matchId}`);
  };

  const getMatchedAnnouncement = (match: Match): Announcement => {
    // Return the announcement that is NOT the current user's announcement
    return match.announcement1.id === announcement?.id 
      ? match.announcement2 
      : match.announcement1;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4ECDC4';
    if (score >= 60) return '#FFD93D';
    return '#FF6B6B';
  };

  const renderMatch = ({ item }: { item: Match }) => {
    const matchedAnnouncement = getMatchedAnnouncement(item);
    
    return (
      <View style={styles.matchContainer}>
        <View style={styles.matchHeader}>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, { color: getScoreColor(item.score) }]}>
              {item.score}% de correspondance
            </Text>
            <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(item.score) }]}>
              <FontAwesome name="star" size={12} color="white" />
            </View>
          </View>
        </View>
        
        <AnnouncementCard
          announcement={matchedAnnouncement}
          onPress={() => router.push(`/announcement/${matchedAnnouncement.id}`)}
          currentUserId={user?.id}
        />
        
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={() => handleContactUser(item)}
        >
          <FontAwesome name="comments" size={20} color="white" />
          <Text style={styles.contactButtonText}>Contacter l'annonceur</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text>Chargement des correspondances...</Text>
      </SafeAreaView>
    );
  }

  if (!announcement) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text>Annonce non trouvée</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Correspondances trouvées</Text>
        <Text style={styles.subtitle}>
          Pour votre annonce: "{announcement.titre}"
        </Text>
      </View>

      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="search" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Aucune correspondance trouvée</Text>
            <Text style={styles.emptySubtext}>
              Les correspondances apparaîtront automatiquement lorsque{'\n'}
              des annonces similaires seront publiées.
            </Text>
          </View>
        }
        ListHeaderComponent={
          matches.length > 0 ? (
            <View style={styles.infoCard}>
              <FontAwesome name="info-circle" size={20} color="#007AFF" />
              <Text style={styles.infoText}>
                {matches.length} correspondance{matches.length > 1 ? 's' : ''} trouvée{matches.length > 1 ? 's' : ''} 
                pour votre annonce. Contactez les annonceurs pour plus d'informations.
              </Text>
            </View>
          ) : null
        }
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
  listContainer: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e6f3ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
    lineHeight: 20,
  },
  matchContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  matchHeader: {
    marginBottom: 15,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    gap: 8,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    color: '#999',
    marginTop: 15,
    marginBottom: 10,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    lineHeight: 20,
  },
});