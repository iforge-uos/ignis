import { User } from "@ignis/types/users.ts";

export interface UserState {
  user: User | null;
  is_loading: boolean;
}
