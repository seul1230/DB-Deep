// Search 타입 정의 기반으로 재작성
import { ChartData } from '@/features/chat/chatTypes';

// 검색된 메시지 구조 (서버 응답의 message 필드)
export interface SearchChatMessage {
  question: string;
  query?: string;
  chart?: ChartData;
  insight?: string;
}

// 검색 결과 항목
export interface SearchChatResult {
  chatId: string;
  title: string;
  message: SearchChatMessage;
  updatedAt: string; // ISO 형식 날짜
}

// 전체 응답 구조
export interface SearchChatResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: SearchChatResult[];
}
