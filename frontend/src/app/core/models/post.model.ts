import { User } from './user.model';

export interface Post {
  id: number;
  content: string;
  mediaUrl?: string;
  timestamp: string;
  author: User;
  likeCount?: number;
  commentCount?: number;
  likedByCurrentUser?: boolean;
}
