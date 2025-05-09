"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";

// Props for the ErrorBoundary component
interface Props {
  children: ReactNode;
  componentName?: string; // Optional: to display which component failed
}

// State for the ErrorBoundary component
interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// A simple card component to display the error message
const ErrorDisplayCard = ({
  error,
  componentName,
}: {
  error: Error | null;
  componentName?: string;
}) => (
  <div className="p-4 my-2 bg-red-100 border border-red-400 text-red-700 rounded-md shadow-md w-full">
    <h3 className="font-bold text-lg mb-2">
      Oops! Component Error {componentName ? `in "${componentName}"` : ""}
    </h3>
    <p className="text-sm mb-1">Something went wrong while rendering this part of the layout.</p>
    {error && (
      <details className="mt-2 text-xs bg-red-50 p-2 rounded">
        <summary className="cursor-pointer font-medium">Error Details</summary>
        <pre className="mt-1 whitespace-pre-wrap break-all">{error.toString()}</pre>
      </details>
    )}
    <p className="text-xs mt-2">
      Please check the console for more detailed technical information.
    </p>
  </div>
);

class ComponentErrorBoundary extends Component<Props, State> {
  // Initialize state so the normal children are rendered
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  // This lifecycle method is called after an error has been thrown by a descendant component.
  // It receives the error that was thrown as a parameter and should return a value to update state.
  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null }; // errorInfo will be set in componentDidCatch
  }

  // This lifecycle method is also called after an error has been thrown by a descendant component.
  // It receives two parameters:
  // 1. error - The error that was thrown.
  // 2. errorInfo - An object with a componentStack key containing information about which component threw the error.
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service here
    console.error("ComponentErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo }); // Store errorInfo for potential display or further logging
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <ErrorDisplayCard error={this.state.error} componentName={this.props.componentName} />;
    }

    // Normally, just render children
    return this.props.children;
  }
}

export default ComponentErrorBoundary;
