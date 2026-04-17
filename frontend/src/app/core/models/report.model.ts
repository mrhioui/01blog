import { User } from './user.model';

export interface Report {
  id: number;
  reporter: User;
  reportedUser: User;
  reason: string;
  timestamp: string;
}
