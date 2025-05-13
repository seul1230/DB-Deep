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
  
  export interface ProjectDetail {
    projectId: string;
    projectTitle: string;
    createdAt: string;
    updatedAt: string;
    chats: ChatItem[];
  }