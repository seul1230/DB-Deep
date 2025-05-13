export interface ChatTimestamp {
  seconds: number;
  nanos: number;
}

export interface ChatMessage {
  id: string;
  uuid: string;
  content: string;
  memberId: number;
  senderType: 'AI' | 'USER';
  timestamp: ChatTimestamp;
}

export interface ChatDetail {
  chatId: string;
  chatTitle: string;
  messages: ChatMessage[];
}

export interface ChatApiResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: ChatDetail;
}

export interface ChartData {
  chart_type: string;
  x: string[];
  y: number[];
  x_label: string;
  y_label: string;
  title: string;
}

export type ChatPart =
  | { type: 'text'; content: string }
  | { type: 'sql'; content: string }
  | { type: 'status'; content: string }
  | { type: 'chart'; content: ChartData };

export interface ChatStreamMessage {
  id: string;
  uuid: string;
  parts: ChatPart[];
  senderType: 'AI' | 'USER';
  isLive: boolean;
}

export interface ChatPayload {
  uuid: string;
  question: string;
  department: string;
}

// ✅ 변환 유틸
export const convertToStreamMessage = (msg: ChatMessage): ChatStreamMessage => {
  const parts: ChatPart[] = [];
  const chartMatch = msg.content.match(/<Chart id="(.*?)" \/>/);

  if (chartMatch) {
    const chartId = chartMatch[1];
    const cleaned = msg.content.replace(/<Chart.*?\/>/g, '').trim();
    if (cleaned) parts.push({ type: 'text', content: cleaned });
    parts.push({
      type: 'chart',
      content: {
        chart_type: 'bar',
        x: [],
        y: [],
        x_label: '',
        y_label: '',
        title: `Chart ID: ${chartId}`, // 임시로 chartId를 title로 노출
      },
    });
  } else {
    parts.push({ type: 'text', content: msg.content });
  }

  return {
    id: msg.id,
    uuid: msg.uuid,
    parts,
    senderType: msg.senderType,
    isLive: false,
  };
};
