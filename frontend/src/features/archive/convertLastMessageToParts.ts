import { ChatPart } from '@/features/chat/chatTypes';
import { ArchiveLastMessage } from './archiveTypes';

function parseMarkdownTable(data: string): Record<string, string | number>[] {
  const lines = data.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
  const rows = lines.slice(2);

  return rows.map(row => {
    const values = row.split('|').map(v => v.trim()).filter(Boolean);
    const record: Record<string, string | number> = {};
    headers.forEach((key, i) => {
      const value = values[i];
      record[key] = isNaN(Number(value)) ? value : Number(value);
    });
    return record;
  });
}

export function convertLastMessageToParts(lastMessage: ArchiveLastMessage): ChatPart[] {
  const parts: ChatPart[] = [];

  if (lastMessage.query) {
    parts.push({ type: 'sql', content: lastMessage.query });
  }

  if (lastMessage.data) {
    const parsed = parseMarkdownTable(lastMessage.data);
    parts.push({ type: 'data', content: parsed });
  }

  if (lastMessage.chart && Object.keys(lastMessage.chart).length > 0) {
    parts.push({ type: 'chart', content: lastMessage.chart }); // ✅ 그대로 사용
  }

  if (lastMessage.insight) {
    parts.push({ type: 'text', content: lastMessage.insight });
  }

  return parts;
}
