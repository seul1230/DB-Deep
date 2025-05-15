export interface ChartData {
  chart_type: string;
  x: string[];
  y: number[];
  x_label: string;
  y_label: string;
  title: string;
}

export interface ArchiveMessage {
  insight: string;
  question: string;
  query: string;
  chart: ChartData;
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