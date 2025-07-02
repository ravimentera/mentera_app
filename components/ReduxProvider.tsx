"use client";

import { store } from "@/lib/store";
import { setToken } from "@/lib/store/slices/authSlice";
import { useEffect } from "react";
import { Provider } from "react-redux";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize auth token from localStorage if available
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      store.dispatch(setToken(storedToken));
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
