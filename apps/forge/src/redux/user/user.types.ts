import { User } from "@ignis/types/users";

export interface UserState {
  user: User | null;
  is_loading: boolean;
}
