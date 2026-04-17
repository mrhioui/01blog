import { User } from './user.model';

export interface Subscription {
  id: number;
  subscriber: User;
  target: User;
  createdAt: string;
}
