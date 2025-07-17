import { Room } from './room';

export enum ServiceAccountTypes {
  PI = 'pi',
  AI = 'ai',
}

interface ServiceAccountBase {
  id: string;
  name: string;
  type: ServiceAccountTypes;
  tokens: string[];
}

export interface RoomServiceAccount extends ServiceAccountBase {
  room: Room;
  type: ServiceAccountTypes.PI;
}
export interface AiServiceAccount extends ServiceAccountBase {
  type: ServiceAccountTypes.AI;
}

export type ServiceAccount = RoomServiceAccount | AiServiceAccount;

export interface RoomServiceAccountUpsertRequest extends ServiceAccountBase {
  roomId: string;
  type: ServiceAccountTypes.PI;
}

export interface AiServiceAccountUpsertRequest extends ServiceAccountBase {
  type: ServiceAccountTypes.AI;
}

export type ServiceAccountUpsertRequest =
  | RoomServiceAccountUpsertRequest
  | AiServiceAccountUpsertRequest;
