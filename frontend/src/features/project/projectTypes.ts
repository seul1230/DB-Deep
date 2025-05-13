export interface Project {
    projectId: string;
    projectName: string;
    chatCount: number;
    createdAt: string;
  }
  
  export interface ChatItem {
    messageId: string;
    message: string;
    updatedAt: string;
  }

  export interface ChatRoom {
    id: string;
    title: string;
    lastMessageAt: string;
  }
  
  export interface ProjectDetail {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    chatRooms: ChatRoom[];
  }