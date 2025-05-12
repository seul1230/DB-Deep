export interface Notification {
  id: number;
  chatId: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  memberName: string;
  chatName: string;
}
