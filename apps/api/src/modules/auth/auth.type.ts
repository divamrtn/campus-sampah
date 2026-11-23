import type { SafeUser } from "../users/user.type.js";

export interface AuthResult {
  token: string;
  user: SafeUser;
}
