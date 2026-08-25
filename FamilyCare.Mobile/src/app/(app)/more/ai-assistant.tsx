import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { aiService } from '@/services/aiService';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AppIcon } from '@/components/ui/AppIcon';
import { useTranslation } from '@/i18n';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function AiAssistantScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am Flash, your FamilyCare AI Assistant. How can I help you manage your family, tasks, bills, or finances today?',
      timestamp: new Date(),
    },
  ]);

  const quickQuestions = [
    'What tasks are pending?',
    'What bills are due soon?',
    'Show monthly expenses & balance',
    'Who has active medicines?',
    'List all family members',
  ];

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isThinking]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputMessage.trim();
    if (!query || isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsThinking(true);

    try {
      const replyText = await aiService.askAssistant(query);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I encountered an issue retrieving that information. Please make sure the backend is connected.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.backgroundElement }]}
    >
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <AppIcon name="chevron.left" tintColor={theme.text} size={24} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <ThemedText type="default" style={styles.headerTitle}>Flash AI</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">Your Personal Family Assistant</ThemedText>
        </View>
        <View style={styles.aiBadge}>
          <AppIcon name="bolt.fill" tintColor="#6366f1" size={14} />
          <ThemedText style={styles.aiBadgeText}>FLASH LIVE</ThemedText>
        </View>
      </ThemedView>

      {/* Quick Suggestion Chips */}
      <View style={styles.chipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {quickQuestions.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.chip, { backgroundColor: theme.background }]}
              onPress={() => handleSend(q)}
              disabled={isThinking}
            >
              <ThemedText type="small" style={styles.chipText}>{q}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages Feed */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={{ padding: Spacing.four, paddingBottom: Spacing.six }}
      >
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                isAi ? [styles.aiBubble, { backgroundColor: theme.background }] : styles.userBubble,
              ]}
            >
              {isAi && (
                <View style={styles.aiAvatar}>
                  <ThemedText style={styles.aiAvatarText}>⚡</ThemedText>
                </View>
              )}
              <View style={styles.bubbleTextContainer}>
                <ThemedText
                  style={[
                    styles.messageText,
                    !isAi && { color: '#ffffff' },
                  ]}
                >
                  {msg.text}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={[
                    styles.timestampText,
                    isAi ? { color: theme.textSecondary } : { color: 'rgba(255,255,255,0.7)' },
                  ]}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </ThemedText>
              </View>
            </View>
          );
        })}

        {isThinking && (
          <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: theme.background }]}>
            <View style={styles.aiAvatar}>
              <ThemedText style={styles.aiAvatarText}>⚡</ThemedText>
            </View>
            <View style={styles.thinkingContainer}>
              <ActivityIndicator size="small" color="#667eea" />
              <ThemedText style={styles.thinkingText}>Flash is thinking...</ThemedText>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <ThemedView style={[styles.inputBar, { backgroundColor: theme.background, borderTopColor: theme.backgroundSelected }]}>
        <TextInput
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
          placeholder="Ask Flash anything..."
          placeholderTextColor={theme.textSecondary}
          value={inputMessage}
          onChangeText={setInputMessage}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
          editable={!isThinking}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputMessage.trim() || isThinking) && { opacity: 0.5 }]}
          onPress={() => handleSend()}
          disabled={!inputMessage.trim() || isThinking}
        >
          <AppIcon name="arrow.right.square.fill" tintColor="#ffffff" size={22} />
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    paddingTop: Spacing.six,
    backgroundColor: 'transparent',
  },
  backButton: { marginRight: Spacing.three },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  aiBadgeText: { color: '#4338ca', fontSize: 11, fontWeight: 'bold' },
  chipsContainer: {
    paddingVertical: Spacing.two,
  },
  chipsScroll: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipText: { color: '#667eea', fontWeight: '600' },
  messagesContainer: { flex: 1 },
  messageBubble: {
    flexDirection: 'row',
    marginVertical: Spacing.two,
    maxWidth: '85%',
    borderRadius: 16,
    padding: Spacing.three,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#667eea',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.two,
  },
  aiAvatarText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  bubbleTextContainer: { flex: 1 },
  messageText: { fontSize: 15, lineHeight: 22 },
  timestampText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  thinkingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  thinkingText: { color: '#64748b', fontSize: 14, fontStyle: 'italic' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    paddingBottom: Platform.OS === 'ios' ? Spacing.six : Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 15,
    marginRight: Spacing.two,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
