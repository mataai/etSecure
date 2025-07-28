import { Room } from './room';
import { User } from './user';

export interface Attendance {
  _id?: string; // Optional ID for the attendance record
  user: User; // ID of the user attending
  room: Room; // ID of the room where the attendance is recorded
  timestamp: number; // Timestamp of when the attendance was recorded
}

export interface CreateAttendanceRequest {
  userId: string;
}
