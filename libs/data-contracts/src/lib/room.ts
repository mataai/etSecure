import { User } from './user';

export interface Room {
  _id?: string;
  name: string;
  location: string;
  users: User[];
}

export type CreateRoomRequest = Pick<Room, 'name' | 'location'>;
