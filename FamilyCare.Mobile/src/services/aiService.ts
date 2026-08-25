import { apiClient } from './apiClient';

export interface AiChatResponse {
  reply: string;
  timestamp: string;
}

export const aiService = {
  async askAssistant(message: string): Promise<string> {
    const response = await apiClient.post<AiChatResponse>('/api/AiAssistant/chat', { message });
    return response.reply;
  },
};
