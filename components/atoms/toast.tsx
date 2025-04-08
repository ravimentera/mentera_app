"use client";

import { cn } from "@/lib/utils";
import { type ReactNode, createContext, useContext, useEffect, useState } from "react";

// Toast Types
export type ToastType = "success" | "error" | "info" | "warning";

// Toast Positions
export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

// Toast interface
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Toast Context interface
interface ToastContextProps {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  position: ToastPosition;
  setPosition: (position: ToastPosition) => void;
}

// Provider Props interface
interface ToastProviderProps {
  children: ReactNode;
  defaultPosition?: ToastPosition;
  defaultDuration?: number;
}

// Create Context
const ToastContext = createContext<ToastContextProps | undefined>(undefined);

// Toast Provider Component
export function ToastProvider({
  children,
  defaultPosition = "top-right",
  defaultDuration = 5000,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [position, setPosition] = useState<ToastPosition>(defaultPosition);

  // Add a toast
  const addToast = (message: string, type: ToastType, duration = defaultDuration) => {
    const id = Date.now().toString();
    const newToast = { id, message, type, duration };
    setToasts((prevToasts) => [...prevToasts, newToast]);
  };

  // Remove a toast
  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Auto-remove toasts after their duration
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prevToasts) => {
          const [, ...rest] = prevToasts;
          return rest;
        });
      }, toasts[0].duration);

      return () => clearTimeout(timer);
    }
  }, [toasts]);

  // Get position classes based on current position
  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4 items-start";
      case "top-center":
        return "top-4 left-1/2 -translate-x-1/2 items-center";
      case "top-right":
        return "top-4 right-4 items-end";
      case "bottom-left":
        return "bottom-4 left-4 items-start";
      case "bottom-center":
        return "bottom-4 left-1/2 -translate-x-1/2 items-center";
      case "bottom-right":
        return "bottom-4 right-4 items-end";
      default:
        return "top-4 right-4 items-end";
    }
  };

  // Get animation classes based on current position
  const getAnimationClasses = () => {
    switch (position) {
      case "top-left":
        return "animate-in-left slide-in-from-left-5";
      case "top-center":
        return "animate-in-top slide-in-from-top-5";
      case "top-right":
        return "animate-in slide-in-from-right-5";
      case "bottom-left":
        return "animate-in-left slide-in-from-left-5";
      case "bottom-center":
        return "animate-in-bottom slide-in-from-bottom-5";
      case "bottom-right":
        return "animate-in slide-in-from-right-5";
      default:
        return "animate-in slide-in-from-right-5";
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, position, setPosition }}>
      {children}
      <div className={cn("fixed z-50 flex flex-col gap-2", getPositionClasses())}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "rounded-md px-4 py-3 shadow-lg transition-all duration-300 fade-in",
              getAnimationClasses(),
              {
                "bg-green-500 text-white": toast.type === "success",
                "bg-red-500 text-white": toast.type === "error",
                "bg-blue-500 text-white": toast.type === "info",
                "bg-yellow-500 text-black": toast.type === "warning",
              },
            )}
          >
            <div className="flex items-center gap-2">
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="ml-auto rounded-full p-1 hover:bg-white/20"
                aria-label="Close toast"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Custom hook to use toast
export function useToast() {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
