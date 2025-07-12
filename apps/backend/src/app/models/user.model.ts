import { ObjectId } from 'mongodb';

export interface UserModel {
  _id: ObjectId;
  authentik_id: number;
  name: string;
  username: string;
  email: string;
}
