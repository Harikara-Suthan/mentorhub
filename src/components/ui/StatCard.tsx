import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
  accent = "navy",
  trend,
  subtext,
  onClick,
  compact = false,
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accent?: "navy" | "gold" | "risk-low" | "risk-high" | "blue" | "purple";
  trend?: { value: string | number; isPositive?: boolean };
  subtext?: string;
  onClick?: () => void;
  compact?: boolean;
}) {
  const accentConfigs = {
    navy: {
      border: "border-slate-200/80 hover:border-slate-300",
      iconBg: "bg-slate-100 text-slate-700",
      valueColor: "text-slate-900",
    },
    gold: {
      border: "border-slate-200/80 hover:border-amber-300",
      iconBg: "bg-amber-50 text-amber-700",
      valueColor: "text-slate-900",
    },
    "risk-low": {
      border: "border-slate-200/80 hover:border-emerald-300",
      iconBg: "bg-emerald-50 text-emerald-700",
      valueColor: "text-slate-900",
    },
    "risk-high": {
      border: "border-rose-200 hover:border-rose-300 bg-rose-50/25",
      iconBg: "bg-rose-100/80 text-rose-700",
      valueColor: "text-rose-700",
    },
    blue: {
      border: "border-slate-200/80 hover:border-blue-300",
      iconBg: "bg-blue-50 text-blue-700",
      valueColor: "text-slate-900",
    },
    purple: {
      border: "border-slate-200/80 hover:border-blue-300",
      iconBg: "bg-blue-50 text-blue-700",
      valueColor: "text-slate-900",
    },
  }[accent];

  return (
    <div
      onClick={onClick}
      className={`app-card p-2.5 sm:p-3 flex flex-col justify-between relative overflow-hidden transition-all duration-150 ${
        onClick ? "cursor-pointer hover:border-blue-300 hover:shadow-xs active:scale-[0.99]" : ""
      } ${accentConfigs.border}`}
    >
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <p className="text-[11px] font-medium text-slate-500 truncate" title={label}>
          {label}
        </p>
        {icon && (
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${accentConfigs.iconBg}`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-1 mt-auto">
        <p className={`font-display text-lg sm:text-xl font-bold tracking-tight leading-none ${accentConfigs.valueColor}`}>
          {value}
        </p>
        {trend && (
          <span
            className={`text-[10px] font-semibold px-1 py-0.5 rounded leading-none ${
              trend.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>

      {subtext && !compact && (
        <p className="text-[10px] text-slate-400 mt-1 truncate leading-tight" title={subtext}>
          {subtext}
        </p>
      )}
    </div>
  );
}
