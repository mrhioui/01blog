import { User } from './user.model';

export interface Comment {
  id: number;
  content: string;
  timestamp: string;
  author: User;
  postId: number;
}
