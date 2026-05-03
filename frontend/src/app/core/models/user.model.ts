export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
  headline: string | null;
  location: string | null;
  about: string | null;
  profilePublic: boolean;
  postCount?: number;
  likeCount?: number;
  commentCount?: number;
  followerCount?: number;
  followingCount?: number;
  isSubscribed?: boolean;
  banned?: boolean;
}
