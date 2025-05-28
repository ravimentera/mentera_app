import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../lib/store";
import {
  type UserRole,
  initializeRole,
  selectIsAdmin,
  selectIsProvider,
  selectIsRoleInitialized,
  selectUserRole,
  setUserRole,
  toggleUserRole,
} from "../lib/store/userRoleSlice";

/**
 * Custom hook for managing user roles
 * Provides role state, actions, and automatic initialization
 */
export const useUserRole = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const role = useSelector(selectUserRole);
  const isAdmin = useSelector(selectIsAdmin);
  const isProvider = useSelector(selectIsProvider);
  const isInitialized = useSelector(selectIsRoleInitialized);

  // Initialize role from localStorage on first render
  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeRole());
    }
  }, [dispatch, isInitialized]);

  // Actions
  const changeRole = (newRole: UserRole) => {
    dispatch(setUserRole(newRole));
  };

  const switchRole = () => {
    dispatch(toggleUserRole());
  };

  return {
    // State
    role,
    isAdmin,
    isProvider,
    isInitialized,

    // Actions
    changeRole,
    switchRole,
  };
};
