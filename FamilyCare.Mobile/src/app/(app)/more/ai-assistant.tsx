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
import { Radius, Shadows, Spacing } from '@/constants/theme';
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
      {/* Header */}
      <ThemedView style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          activeOpacity={0.7}
        >
          <AppIcon name="chevron.left" tintColor={theme.text} size={20} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View style={styles.titleRow}>
            <ThemedText type="default" style={styles.headerTitle}>
              Flash AI
            </ThemedText>
            <View style={[styles.aiBadge, { backgroundColor: theme.purpleBg }]}>
              <AppIcon name="bolt.fill" tintColor={theme.primary} size={12} />
              <ThemedText style={[styles.aiBadgeText, { color: theme.primary }]}>
                LIVE
              </ThemedText>
            </View>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            Your Personal Family Assistant
          </ThemedText>
        </View>
      </ThemedView>

      {/* Quick Suggestion Chips */}
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {quickQuestions.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.chip,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
                Shadows.soft,
              ]}
              onPress={() => handleSend(q)}
              disabled={isThinking}
              activeOpacity={0.8}
            >
              <AppIcon name="bolt.circle" tintColor={theme.primary} size={14} style={{ marginRight: 6 }} />
              <ThemedText type="small" style={[styles.chipText, { color: theme.text }]}>
                {q}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages Feed */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={{ padding: Spacing.four, paddingBottom: Spacing.six }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isAi ? styles.aiRow : styles.userRow,
              ]}
            >
              {isAi && (
                <View style={[styles.aiAvatar, { backgroundColor: theme.primary }]}>
                  <AppIcon name="bolt.fill" tintColor="#ffffff" size={14} />
                </View>
              )}

              <View
                style={[
                  styles.messageBubble,
                  isAi
                    ? [
                        styles.aiBubble,
                        {
                          backgroundColor: theme.card,
                          borderColor: theme.cardBorder,
                        },
                        Shadows.soft,
                      ]
                    : [
                        styles.userBubble,
                        { backgroundColor: theme.primary },
                        Shadows.soft,
                      ],
                ]}
              >
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
                    isAi
                      ? { color: theme.textSecondary }
                      : { color: 'rgba(255,255,255,0.75)' },
                  ]}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </ThemedText>
              </View>
            </View>
          );
        })}

        {isThinking && (
          <View style={[styles.messageRow, styles.aiRow]}>
            <View style={[styles.aiAvatar, { backgroundColor: theme.primary }]}>
              <AppIcon name="bolt.fill" tintColor="#ffffff" size={14} />
            </View>
            <View
              style={[
                styles.messageBubble,
                styles.aiBubble,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
                Shadows.soft,
              ]}
            >
              <View style={styles.thinkingContainer}>
                <ActivityIndicator size="small" color={theme.primary} />
                <ThemedText type="small" themeColor="textSecondary" style={styles.thinkingText}>
                  Flash is analyzing family data...
                </ThemedText>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <ThemedView
        style={[
          styles.inputBar,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.cardBorder,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.inputBorder,
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ask Flash anything about your family..."
            placeholderTextColor={theme.textSecondary}
            value={inputMessage}
            onChangeText={setInputMessage}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            editable={!isThinking}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: theme.primary },
            (!inputMessage.trim() || isThinking) && { opacity: 0.4 },
            inputMessage.trim() && Shadows.glowPrimary,
          ]}
          onPress={() => handleSend()}
          disabled={!inputMessage.trim() || isThinking}
          activeOpacity={0.85}
        >
          <AppIcon name="arrow.right.square.fill" tintColor="#ffffff" size={20} />
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.three,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
    borderWidth: 1,
  },
  headerTitleContainer: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    gap: 4,
  },
  aiBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  chipsContainer: {
    paddingVertical: Spacing.two,
  },
  chipsScroll: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: { fontWeight: '600', fontSize: 12 },
  messagesContainer: { flex: 1 },
  messageRow: {
    flexDirection: 'row',
    marginVertical: Spacing.two,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.two,
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: { fontSize: 14, lineHeight: 21 },
  timestampText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  thinkingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  thinkingText: { fontStyle: 'italic', fontSize: 13 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    paddingBottom: Platform.OS === 'ios' ? Spacing.six : Spacing.three,
    borderTopWidth: 1,
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    height: 46,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
  },
  input: {
    height: '100%',
    fontSize: 14,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
