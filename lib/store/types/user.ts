// Define the user role types
export type UserRole = "admin" | "provider";

// Define the state structure for this slice
export interface UserRoleState {
  role: UserRole;
  isInitialized: boolean;
}
