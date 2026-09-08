import React from "react";

export function Badge({
  children,
  tone = "neutral",
  size = "md",
  withDot = false,
  className = "",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "brand" | "purple";
  size?: "sm" | "md" | "lg";
  withDot?: boolean;
  className?: string;
}) {
  const styles: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    neutral: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      dot: "bg-slate-400",
      border: "border-slate-200/60",
    },
    success: {
      bg: "bg-emerald-50 text-emerald-700",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      border: "border-emerald-200/60",
    },
    warning: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      dot: "bg-amber-500",
      border: "border-amber-200/60",
    },
    danger: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      dot: "bg-rose-500",
      border: "border-rose-200/60",
    },
    info: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      dot: "bg-blue-500",
      border: "border-blue-200/60",
    },
    brand: {
      bg: "bg-brand-50",
      text: "text-brand-700",
      dot: "bg-brand-500",
      border: "border-brand-200/60",
    },
    purple: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      dot: "bg-blue-500",
      border: "border-blue-200/60",
    },
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] font-medium gap-1.5",
    md: "px-2.5 py-1 text-xs font-medium gap-1.5",
    lg: "px-3 py-1.5 text-sm font-semibold gap-2",
  }[size];

  const current = styles[tone] || styles.neutral;

  return (
    <span
      className={`inline-flex items-center rounded-full border whitespace-nowrap ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
    >
      {withDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />}
      {children}
    </span>
  );
}

