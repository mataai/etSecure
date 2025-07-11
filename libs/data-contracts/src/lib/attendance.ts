export interface Attendance {
  _id?: string; // Optional ID for the attendance record
  userId: string; // ID of the user attending
  roomId: string; // ID of the room where the attendance is recorded
  timestamp: Date; // Timestamp of when the attendance was recorded
}

export interface CreateAttendanceRequest {
  userId: string;
}
