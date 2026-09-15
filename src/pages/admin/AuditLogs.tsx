import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserCheck,
  Search,
  RefreshCw,
  Eye,
  X,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Shield
} from "lucide-react";
import { api, apiErrorMessage } from "../../api/client";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/LoadingState";
import { BackButton } from "../../components/ui/BackButton";

interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  actor: string;
  actorRole: string;
  metadata: any;
  ipAddress: string;
  userAgent?: string | null;
  createdAt: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Inspector modal
  const [inspectedLog, setInspectedLog] = useState<AuditLogItem | null>(null);

  const loadLogs = async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/admin/audit-logs", {
        params: {
          search: searchTerm || undefined,
          entity: entityFilter !== "ALL" ? entityFilter : undefined,
          page: targetPage,
          pageSize: 25,
        },
      });
      const data = res.data.data;
      setLogs(data.items || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
      setError("");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(1);
  }, [entityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs(1);
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["Timestamp", "Action", "Actor", "Actor Role", "Entity", "Entity ID", "IP Address"];
    const rows = logs.map((l) => [
      new Date(l.createdAt).toISOString(),
      `"${l.action}"`,
      `"${l.actor}"`,
      `"${l.actorRole}"`,
      `"${l.entity}"`,
      `"${l.entityId || ""}"`,
      `"${l.ipAddress}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 md:p-7 rounded-2xl bg-sky-50 text-blue-950 border border-blue-100/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <BackButton fallback="/dashboard" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles size={11} className="text-blue-500" /> Admin Core
              </span>
              <span className="text-xs text-blue-800/80 font-medium">Compliance & Security Trail</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Audit & Governance Ledger
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Cryptographic and persistent event trail tracking all administrative interventions, role modifications, and cohort operations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportCSV}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <FileDown size={13} /> Export CSV
            </button>
            <button
              onClick={() => loadLogs(page)}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="app-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, actor, or entity..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 transition-all"
          />
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-500">Entity:</span>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium text-slate-800"
            >
              <option value="ALL">All Entities</option>
              <option value="User">User</option>
              <option value="Mentor">Mentor</option>
              <option value="Student">Student</option>
              <option value="Department">Department</option>
              <option value="SystemSettings">System Settings</option>
              <option value="Meeting">Meeting</option>
              <option value="Issue">Issue</option>
            </select>
          </div>

          <span className="text-xs font-mono text-slate-500">{totalCount} Events Recorded</span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="app-card overflow-hidden">
        {loading ? (
          <LoadingState label="Loading audit trail ledger..." />
        ) : error ? (
          <div className="p-6">
            <ErrorState error={error} onRetry={() => loadLogs(1)} />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No audit events found"
              description="No audit logs match the specified search or filter parameters."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Event Action</th>
                  <th className="py-3 px-4">Initiator / Actor</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-sans">
                      <div className="font-medium">{log.actor}</div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">
                        [{log.actorRole}]
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-semibold">{log.entity}</span>
                      {log.entityId && (
                        <span className="text-[10px] text-slate-400 ml-1 truncate max-w-[120px] inline-block align-bottom">
                          #{log.entityId.slice(0, 8)}...
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {log.ipAddress}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-sans">
                      {new Date(log.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => setInspectedLog(log)}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="View payload metadata"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Page {page} of {totalPages}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => loadLogs(page - 1)}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => loadLogs(page + 1)}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Metadata Inspector Drawer/Modal */}
      {inspectedLog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Shield size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Audit Event Metadata</h2>
                  <p className="text-[11px] font-mono text-slate-500">{inspectedLog.action}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Actor</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{inspectedLog.actor}</div>
                  <span className="text-[10px] text-slate-500">Role: {inspectedLog.actorRole}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Entity</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{inspectedLog.entity}</div>
                  <span className="text-[10px] font-mono text-slate-500">ID: {inspectedLog.entityId || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Client IP</span>
                  <div className="font-mono text-slate-800 mt-0.5">{inspectedLog.ipAddress}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Timestamp</span>
                  <div className="text-slate-800 mt-0.5">{new Date(inspectedLog.createdAt).toISOString()}</div>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1.5">Action Payload / Metadata</span>
                <pre className="p-3.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto border border-slate-800">
                  {JSON.stringify(inspectedLog.metadata || {}, null, 2)}
                </pre>
              </div>

              {inspectedLog.userAgent && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">User Agent Header</span>
                  <p className="text-[11px] text-slate-600 font-mono break-all p-2 bg-slate-50 rounded-lg border border-slate-100">
                    {inspectedLog.userAgent}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInspectedLog(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
