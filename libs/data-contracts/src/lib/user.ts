export interface UserAuthentik {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  preferred_username: string;
  nickname: string;
  groups: string[];
}

export interface User {
  _id?: string;
  authentik_id?: string;
  name: string;
  email: string;
  username: string;
  groups: string[];
}

export interface CreateUserRequest {
  name: string;
  username: string;
  email: string;
}

export interface UpdateUserRequest {
  id?: string;
  name?: string;
  email?: string;
  groups?: string[];
}
