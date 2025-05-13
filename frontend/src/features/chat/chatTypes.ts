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
  