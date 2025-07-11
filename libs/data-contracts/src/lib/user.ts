export class UserAuthentik {
  public sub!: string;
  public email!: string;
  public email_verified!: boolean;
  public name!: string;
  public given_name!: string;
  public preferred_username!: string;
  public nickname!: string;
  public groups!: string[];
}

export class User {
  public _id!: string;
  public authentik_id!: string; // ID from Authentik
  public name!: string;
  public username!: string;
}
