import { ChartData } from "../chat/chatTypes";

export interface ArchiveMessage {
  insight: string;
  question: string;
  query: string;
  chart: ChartData;
  data?: string;
}

export interface ArchiveItem {
  archiveId: number;
  messageId: string;
  chatRoomId: string;
  chatName: string;
  lastMessage: ArchiveMessage;
  chatSentAt: string;
  archivedAt: string;
}

export interface ArchiveResponse {
  result: ArchiveItem[];
}

export interface ArchiveLastMessage {
  insight?: string;
  question?: string;
  query?: string;
  data?: string;
  chart?: ChartData;
}