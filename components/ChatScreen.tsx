import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { GiftedChat, IMessage, InputToolbar, Send } from 'react-native-gifted-chat';
import { useLocalSearchParams } from 'expo-router';
import { apiService } from '../services/apiService';
import { ChatMessage, User } from '../types';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const {user} = useSelector  ((state: any) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [matchId]);

  const loadData = async () => {
    try {
      if (typeof matchId === 'string') {
        const chatMessages = await apiService.getChatMessages(matchId);
        
        // Convert ChatMessage to IMessage format for GiftedChat
        const formattedMessages: IMessage[] = chatMessages.map((msg) => ({
          _id: msg._id,
          text: msg.text,
          createdAt: msg.createdAt,
          user: {
            _id: msg.user._id,
            name: msg.user.name,
            avatar: msg.user.avatar,
          },
        }));

        setMessages(formattedMessages.reverse());
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger la conversation');
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (!user || typeof matchId !== 'string') return;

    const message = newMessages[0];
    
    try {
      // Optimistically update UI
      setMessages(previousMessages => 
        GiftedChat.append(previousMessages, newMessages)
      );

      // Send message to backend
      await apiService.sendChatMessage(matchId, message.text);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
      console.error('Error sending message:', error);
      
      // Remove the message from UI if sending failed
      setMessages(previousMessages => 
        previousMessages.filter(msg => msg._id !== message._id)
      );
    }
  }, [user, matchId]);

  if (!user) {
    return <View style={styles.container} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        }}
        placeholder="Tapez votre message..."
        showUserAvatar={true}
        alwaysShowSend={true}
        scrollToBottom={true}
        scrollToBottomComponent={() => null}
        renderTime={() => null}
        showAvatarForEveryMessage={false}
        textInputProps={styles.textInput}
        renderInputToolbar={(props) => (
          <InputToolbar
            {...props}
            containerStyle={styles.inputToolbar}
          />
        )}
        renderSend={(props) => (
          <Send {...props}>
            <View style={styles.sendButton}>
              <Ionicons name="send" size={28} color="#007AFF" />
            </View>
          </Send>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  textInput: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 10,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputToolbar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginLeft: 5,
  },
});