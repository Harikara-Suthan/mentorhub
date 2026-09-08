import React from "react";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading data..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-muted gap-3.5 animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-navy rounded-full animate-spin" />
        <div className="absolute w-5 h-5 rounded-full bg-gold/20 animate-ping" />
      </div>
      <p className="text-sm font-medium text-slate-muted">{label}</p>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200/70 rounded-xl ${className}`} />;
}

export function ErrorState({
  message,
  error,
  onRetry,
}: {
  message?: string;
  error?: string;
  onRetry?: () => void;
}) {
  const displayMsg = message || error || "An unexpected error occurred.";
  return (
    <div className="app-card p-8 text-center border-rose-200 bg-rose-50/40">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
        <AlertCircle size={22} />
      </div>
      <p className="text-base font-semibold text-rose-900 mb-1">Something went wrong</p>
      <p className="text-sm text-rose-700 max-w-md mx-auto mb-4">{displayMsg}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-xs border-rose-300 hover:bg-rose-100 cursor-pointer">
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  description,
  icon,
  action,
}: {
  title: string;
  hint?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
}) {
  const displayHint = hint || description;
  return (
    <div className="app-card p-12 text-center flex flex-col items-center justify-center border-dashed border-slate-200 bg-surface/30">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-muted flex items-center justify-center mb-3.5">
        {icon || <Inbox size={26} className="text-slate-400" />}
      </div>
      <p className="font-display text-lg font-bold text-navy mb-1">{title}</p>
      {displayHint && <p className="text-sm text-slate-muted max-w-sm mb-4 leading-relaxed">{displayHint}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-primary text-xs cursor-pointer">
          {action.label}
        </button>
      )}
    </div>
  );
}

