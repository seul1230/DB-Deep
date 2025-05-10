export interface ArchiveItem {
    archiveId: number;
    messageId: string;
    lastMessage: string;
    chatSentAt: string;
    archivedAt: string;
  }
  
  export interface ArchiveResponse {
    result: ArchiveItem[];
  }