import { User } from './user.model';
import { Post } from './post.model';

export const MOCK_USERS: User[] = [
  { 
    id: 1, 
    username: 'john_doe', 
    email: 'john@example.com', 
    role: 'ROLE_USER', 
    profileImageUrl: null, 
    bannerImageUrl: null,
    headline: 'Explorer & Blogger',
    location: 'New York, USA',
    about: 'I love writing about new things.',
    profilePublic: true 
  },
  { 
    id: 2, 
    username: 'admin', 
    email: 'admin@example.com', 
    role: 'ROLE_ADMIN', 
    profileImageUrl: null, 
    bannerImageUrl: null,
    headline: 'Platform Administrator',
    location: 'Silicon Valley, CA',
    about: 'Managing the 01Blog platform.',
    profilePublic: true 
  }
];

export const MOCK_POSTS: Post[] = [
  { id: 1, content: 'First post on 01Blog!', timestamp: new Date().toISOString(), author: MOCK_USERS[0] }
];
