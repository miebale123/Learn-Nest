import { User } from "../user.entity";

export interface RequestWithUserAndCookies extends Request {
  user: User;
  cookies: Record<string, string>;
}