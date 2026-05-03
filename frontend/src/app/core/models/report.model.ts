import { Post } from './post.model';
import { User } from './user.model';

export interface Report {
  id: number;
  reporter: User;
  reportedUser?: User;
  reportedPost?: Post;
  reason: string;
  timestamp: string;
}
