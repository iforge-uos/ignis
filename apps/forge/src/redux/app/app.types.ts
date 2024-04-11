export type Apps = "Main" | "Sign In" | "Printing" | "Social" | "Admin" | "Training";

export interface AppState {
  current_app: Apps;
  is_loading: boolean;
}
