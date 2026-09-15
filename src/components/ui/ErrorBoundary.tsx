import React, { Component, ErrorInfo, ReactNode } from "react";
import { clearAppSessionCaches } from "../../utils/storage";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
  componentStack: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: "",
    componentStack: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || "An unexpected rendering error occurred.",
      componentStack: "",
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[MentorHUB ErrorBoundary] Uncaught runtime exception:", error, errorInfo);
    this.setState({
      componentStack: errorInfo?.componentStack || "",
    });
  }

  private handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  private handleClearAndReload = () => {
    clearAppSessionCaches();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  private handleGoToLogin = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          id="mentorhub-error-boundary-root"
          className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-900 text-white font-sans selection:bg-blue-500 selection:text-white"
          style={{ minHeight: "100vh", backgroundColor: "#0F172A", color: "#FFFFFF" }}
        >
          <div className="w-full max-w-lg bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {/* Header Icon & Brand */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-xl">
                ⚠️
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">MentorHUB Recovery Center</h1>
                <p className="text-xs text-slate-400 font-medium">An unexpected exception was safely intercepted</p>
              </div>
            </div>

            {/* Explanatory Note */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 mb-6 space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                The application encountered an unexpected state. Your stored data is safe. You can reload the workspace or reset session caches to restore the interface.
              </p>
              {this.state.errorMessage && (
                <div className="text-[11px] font-mono text-rose-300/90 bg-rose-950/40 p-2.5 rounded-xl border border-rose-900/50 break-words">
                  {this.state.errorMessage}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearAndReload}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-all border border-slate-600 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Clear Cache & Sign In</span>
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={this.handleGoToLogin}
                className="text-[11px] text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
              >
                Go directly to Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const RootErrorBoundary = ErrorBoundary;
