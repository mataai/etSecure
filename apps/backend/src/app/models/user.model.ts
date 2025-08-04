import { ObjectId } from 'mongodb';

export interface UserModel {
  _id: ObjectId;
  authentik_id: string;
  name: string;
  username: string;
  email: string;
  bypassLeft: number;
  uploadsLeft: number;
}
