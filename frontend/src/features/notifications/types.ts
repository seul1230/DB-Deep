export interface Notification {
    notificationId: number;
    chatId: number;
    content: string;
    isRead: boolean;
    isAccepted: boolean | null;
    createdAt: string;
  }
  