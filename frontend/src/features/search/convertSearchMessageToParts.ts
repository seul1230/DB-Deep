import { SearchChatMessage } from '@/features/search/searchTypes';
import { ChatPart } from '@/features/chat/chatTypes';

export const convertSearchMessageToParts = (message: SearchChatMessage): ChatPart[] => {
  const parts: ChatPart[] = [];

  if (message.question) {
    parts.push({ type: 'text', content: message.question });
  }

  if (message.query) {
    parts.push({ type: 'sql', content: message.query });
  }

  if (message.chart && Object.keys(message.chart).length > 0) {
    parts.push({
      type: 'chart',
      content: message.chart,
    });
  }

  if (message.insight) {
    parts.push({ type: 'text', content: message.insight });
  }

  return parts;
};
