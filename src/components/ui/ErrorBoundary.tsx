import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-surface text-center">
          <h1 className="text-2xl font-bold text-error mb-4">Something went wrong.</h1>
          <button
            className="px-4 py-2 bg-primary text-white rounded"
            onClick={() => window.location.href = "/"}
          >
            Go to Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
