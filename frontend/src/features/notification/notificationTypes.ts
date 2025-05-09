export interface Notification {
  id: number;
  content: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  chatId: string;
}