import { ObjectId } from 'mongodb';

export interface AttendanceModel {
  _id: ObjectId;
  roomId: ObjectId;
  userId: ObjectId;
  timestamp: Date;
  type: 'bypass' | 'unlock';
  image?: Buffer; // Optional field for storing image data
}
