import { UserShort } from './user';

export interface Room {
  _id?: string;
  name: string;
  location: string;
  users: UserShort[];
}

export type RoomUpsertRequest = Pick<Room, 'name' | 'location'>;

export interface RoomAccessUpdateRequest {
  userIds: string[];
}
