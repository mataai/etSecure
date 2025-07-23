import { ObjectId } from 'mongodb';

interface ServiceAccountModelBase {
  _id: ObjectId;
  name: string;
  type: 'pi' | 'ai';
  tokens: string[];
}

export interface RoomServiceAccountModel extends ServiceAccountModelBase {
  roomId: ObjectId;
  type: 'pi';
}

export interface AIServiceAccountModel extends ServiceAccountModelBase {
  type: 'ai';
}

export type ServiceAccountModel =
  | RoomServiceAccountModel
  | AIServiceAccountModel;
