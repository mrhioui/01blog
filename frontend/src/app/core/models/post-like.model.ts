import { User } from './user.model';

export interface PostLike {
  id: number;
  user: User;
  postId: number;
}
