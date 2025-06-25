import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { UserRole, UserRoleState } from "../types";

// Helper function to get role from localStorage
const getRoleFromLocalStorage = (): UserRole => {
  if (typeof window !== "undefined") {
    const storedRole = localStorage.getItem("loggedInUserRole");
    if (storedRole === "admin" || storedRole === "provider") {
      return storedRole;
    }
  }
  return "provider"; // Default to provider
};

// Helper function to set role in localStorage
const setRoleInLocalStorage = (role: UserRole): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("loggedInUserRole", role);
  }
};

// Define the initial state
const initialState: UserRoleState = {
  role: "provider", // Will be updated on initialization
  isInitialized: false,
};

// Create the slice
export const userRoleSlice = createSlice({
  name: "userRole",
  initialState,
  reducers: {
    /**
     * Initialize the role from localStorage
     */
    initializeRole: (state) => {
      state.role = getRoleFromLocalStorage();
      state.isInitialized = true;
    },
    /**
     * Sets the user role and persists it to localStorage
     * @param action.payload - The user role ("admin" or "provider")
     */
    setUserRole: (state, action: PayloadAction<UserRole>) => {
      state.role = action.payload;
      setRoleInLocalStorage(action.payload);
    },
    /**
     * Toggles between admin and provider roles
     */
    toggleUserRole: (state) => {
      const newRole: UserRole = state.role === "admin" ? "provider" : "admin";
      state.role = newRole;
      setRoleInLocalStorage(newRole);
    },
  },
});

// Export actions
export const { initializeRole, setUserRole, toggleUserRole } = userRoleSlice.actions;

// Export selectors
export const selectUserRole = (state: RootState): UserRole => state.userRole.role;
export const selectIsRoleInitialized = (state: RootState): boolean => state.userRole.isInitialized;
export const selectIsAdmin = (state: RootState): boolean => state.userRole.role === "admin";
export const selectIsProvider = (state: RootState): boolean => state.userRole.role === "provider";

// Export the reducer - this will be added to your Redux store
export default userRoleSlice.reducer;
