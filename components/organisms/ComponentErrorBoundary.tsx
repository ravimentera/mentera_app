"use client"; // Assuming this might be needed if it's part of a client-side rendering tree

import { Component, ErrorInfo, ReactNode } from "react";

// Props for the ErrorBoundary component
interface Props {
  children: ReactNode;
  componentName?: string; // Optional: to help developers identify the component via logs
}

// State for the ErrorBoundary component
interface State {
  hasError: boolean;
  // error: Error | null; // We still store the error for logging, but don't expose it directly to user
  // errorInfo: ErrorInfo | null; // We still store errorInfo for logging
}

// Updated ErrorDisplayCard for a more user-friendly message
const UserFriendlyErrorDisplay = ({ componentName }: { componentName?: string }) => (
  <div className="p-4 my-2 bg-orange-100 border border-orange-300 text-orange-700 rounded-md shadow-sm w-full text-center">
    <h3 className="font-semibold text-md mb-1">Something Went Wrong</h3>
    <p className="text-sm">
      We&apos;re sorry, but a part of this page encountered a temporary issue.
    </p>
    <p className="text-xs mt-2">
      Please try refreshing the page. If the problem persists, our team has been notified.
    </p>
    {/*
      You could add a "Try Again" button here, but its functionality would depend
      on how you want to reset the error state or the component's state.
      A simple refresh is often the most straightforward initial suggestion.
      Example:
      <button
        onClick={() => window.location.reload()}
        className="mt-3 px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
      >
        Refresh Page
      </button>
    */}
    {/* {componentName && process.env.NODE_ENV === 'development' && (
      <p className="text-xs mt-2 text-gray-500">(Developer info: Error in component &quot;{componentName}&quot;)</p>
    )} */}
  </div>
);

class ComponentErrorBoundary extends Component<Props, State> {
  // Initialize state so the normal children are rendered
  public state: State = {
    hasError: false,
    // error: null, // Not directly needed in state if only logging
    // errorInfo: null, // Not directly needed in state if only logging
  };

  // This lifecycle method is called after an error has been thrown by a descendant component.
  public static getDerivedStateFromError(_: Error): Pick<State, "hasError"> {
    // Update state so the next render will show the fallback UI.
    // We only need to set hasError to true. The actual error object is handled by componentDidCatch.
    return { hasError: true };
  }

  // This lifecycle method is also called after an error has been thrown by a descendant component.
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error and errorInfo to the console for developers
    console.error(
      "ComponentErrorBoundary caught an error:",
      error,
      errorInfo,
      "Component Name:",
      this.props.componentName,
    );
    // You could also log the error to an external error reporting service here:
    // logErrorToMyService(error, errorInfo, { componentName: this.props.componentName });

    // No need to call this.setState({ error, errorInfo }) unless you want to pass them to the fallback UI,
    // which we are avoiding for the user-facing message. getDerivedStateFromError already set hasError.
  }

  public render() {
    if (this.state.hasError) {
      // Render the user-friendly fallback UI
      return <UserFriendlyErrorDisplay componentName={this.props.componentName} />;
    }

    // Normally, just render children
    return this.props.children;
  }
}

export default ComponentErrorBoundary;
