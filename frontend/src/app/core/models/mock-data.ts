import { User } from './user.model';
import { Post } from './post.model';

export const MOCK_USERS: User[] = [
  { id: 1, username: 'john_doe', email: 'john@example.com', role: 'ROLE_USER' },
  { id: 2, username: 'admin', email: 'admin@example.com', role: 'ROLE_ADMIN' }
];

export const MOCK_POSTS: Post[] = [
  { id: 1, content: 'First post on 01Blog!', timestamp: new Date().toISOString(), author: MOCK_USERS[0] }
];
