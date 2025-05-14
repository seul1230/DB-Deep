export interface ArchiveItem {
    archiveId: number;
    messageId: string;
    chatRoomId: string;
    chatName: string;
    lastMessage: string;
    chatSentAt: string;
    archivedAt: string;
  }
  
  export interface ArchiveResponse {
    result: ArchiveItem[];
  }