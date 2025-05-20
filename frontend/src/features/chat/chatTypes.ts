// ==============================
// ✅ 1. API 응답 타입 (서버 원형 데이터)
// ==============================

export interface ChatTimestamp {
  seconds: number;
  nanos: number;
}

export interface ChatMessage {
  id: string;
  uuid: string;
  content: string | ParsedChatContent;
  memberId: number;
  senderType: 'ai' | 'user';
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

// ==============================
// ✅ 2. 클라이언트 내부 렌더링용 타입
// ==============================

export type ChatPart =
  | { type: 'text'; content: string }
  | { type: 'sql'; content: string }
  | { type: 'status'; content: string }
  | { type: 'chart'; content: ChartData }
  | { type: 'data'; content: Record<string, string | number>[] }
  | { type: 'hr'; content?: null };;

export interface ChatStreamMessage {
  id: string;
  uuid: string;
  parts: ChatPart[];
  senderType: 'ai' | 'user';
  isLive: boolean;
  type?: string;
}

// ==============================
// ✅ 3. 차트 데이터 타입
// ==============================

export interface ChartData {
  chart_type: string;
  x: string[];
  y: number[];
  x_label: string;
  y_label: string;
  title: string;
}

// ==============================
// ✅ 4. JSON 기반 콘텐츠 content 파싱용 타입
// ==============================

export interface ParsedChatContent {
  question: string;
  insight?: string;
  query?: string;
  chart?: ChartData;
  data?: Record<string, string | number>[];
}

// ==============================
// ✅ 5. 사용자 메시지 전송 페이로드 타입
// ==============================

export interface ChatPayload {
  uuid: string;
  question: string;
  user_department: string;
}

// ==============================
// ✅ 6. 변환 유틸 - ChatMessage → ChatStreamMessage
// ==============================

export const convertToStreamMessage = (msg: ChatMessage): ChatStreamMessage => {
  const parts: ChatPart[] = [];

  // ✅ user 메시지는 항상 question을 text로 추가
  if (msg.senderType === 'user') {
    if (typeof msg.content === 'object' && msg.content && 'question' in msg.content) {
      parts.push({ type: 'text', content: msg.content.question });
    } else {
      parts.push({ type: 'text', content: String(msg.content) });
    }
  } else {
    // ✅ AI 메시지 처리
    let parsed: ParsedChatContent | null = null;

    if (typeof msg.content === 'string') {
      try {
        const maybeParsed = JSON.parse(msg.content);
        if (maybeParsed && typeof maybeParsed === 'object' && 'question' in maybeParsed) {
          parsed = maybeParsed;
        } else {
          parts.push({ type: 'text', content: msg.content });
        }
      } catch {
        parts.push({ type: 'text', content: msg.content });
      }
    } else if (typeof msg.content === 'object' && msg.content !== null && 'question' in msg.content) {
      parsed = msg.content as ParsedChatContent;
    }

    if (parsed) {
      if (parsed.insight) {
        parts.push({ type: 'text', content: parsed.insight });
      }
      if (parsed.query) {
        parts.push({ type: 'sql', content: parsed.query });
      }
      if (parsed.chart) {
        parts.push({ type: 'chart', content: parsed.chart });
      }
      if (parsed.data) {
        parts.push({ type: 'data', content: parsed.data });
      }
    }
  }

  return {
    id: msg.id,
    uuid: msg.uuid,
    parts,
    senderType: msg.senderType,
    isLive: false,
  };
};
