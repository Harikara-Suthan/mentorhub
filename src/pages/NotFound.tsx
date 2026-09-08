import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Home, Sparkles } from "lucide-react";

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="app-card max-w-md w-full p-8 text-center space-y-6 shadow-sm border border-slate-200/80">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 shadow-2xs">
          <AlertCircle size={32} />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200">
            Error 404 · Route Not Found
          </span>
          <h1 className="font-display text-2xl font-bold text-slate-950">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            The destination <code className="font-mono text-blue-600 font-semibold bg-blue-50 px-1 py-0.5 rounded">{location.pathname}</code> does not exist or has been relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Home size={14} /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
