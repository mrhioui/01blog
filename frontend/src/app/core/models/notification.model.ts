import { User } from './user.model';

export type NotificationType = 'NEW_POST' | 'POST_LIKE' | 'POST_COMMENT' | 'FOLLOW';

export interface Notification {
  id: number;
  user: User;
  message: string;
  type: NotificationType;
  relatedId: number;
  isRead: boolean;
  timestamp: string;
}
