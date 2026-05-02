import { User } from './user.model';

export interface Notification {
  id: number;
  user: User;
  message: string;
  type: string;
  relatedId: number;
  isRead: boolean;
  timestamp: string;
}
