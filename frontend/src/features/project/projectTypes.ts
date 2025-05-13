export interface Project {
    projectId: string;
    projectName: string;
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