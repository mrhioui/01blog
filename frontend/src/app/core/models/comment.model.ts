import { User } from './user.model';
import { Post } from './post.model';

export interface Comment {
  id: number;
  content: string;
  timestamp: string;
  author: User;
  postId?: number; // optionally returning just post id
}
