import { User } from './user';

export interface Room {
  _id?: string;
  name: string;
  location: string;
  users: User[];
}

export type RoomUpsertRequest = Pick<Room, 'name' | 'location'>;

export interface RoomAccessUpdateRequest {
  userIds: string[];
}
