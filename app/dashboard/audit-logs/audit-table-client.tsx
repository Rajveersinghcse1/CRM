"use client";

import { useState } from "react";
import {
  History,
  Search,
  Filter,
  User,
  Clock,
  Layers,
  FileText,
  Eye,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import type { AuditLog } from "@/types/crm";

interface AuditTableClientProps {
  logs: AuditLog[];
}
export function AuditTableClient({ logs }: AuditTableClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [inspectLog, setInspectLog] = useState<AuditLog | null>(null);

  // Distinct entities
  const entities = Array.from(new Set(logs.map((l) => l.entity).filter(Boolean)));

  // Distinct contributors
  const users = Array.from(
    new Set(
      logs
        .map((l) => l.user_name || l.user_email)
        .filter(Boolean) as string[]
    )
  );

  const filteredLogs = logs.filter((log) => {
    const actor = (log.user_name || log.user_email || "System").toLowerCase();
    const email = (log.user_email || "").toLowerCase();
    const action = log.action.toLowerCase();
    const entity = (log.entity || "").toLowerCase();
    const recordTitle = (log.record_title || "").toLowerCase();
    const recordId = (log.record_id || "").toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      query === "" ||
      actor.includes(query) ||
      email.includes(query) ||
      action.includes(query) ||
      entity.includes(query) ||
      recordTitle.includes(query) ||
      recordId.includes(query);

    const matchesEntity = selectedEntity === "all" || log.entity === selectedEntity;
    const matchesUser =
      selectedUser === "all" ||
      (log.user_name && log.user_name === selectedUser) ||
      (log.user_email && log.user_email === selectedUser);
    const matchesAction = selectedAction === "all" || log.action === selectedAction;

    return matchesSearch && matchesEntity && matchesUser && matchesAction;
  });

  // KPI calculations
  const totalEntries = logs.length;
  const uniqueUsersCount = users.length;
  const creationsCount = logs.filter((l) => l.action.toLowerCase().includes("create")).length;
  const updatesCount = logs.filter(
    (l) => l.action.toLowerCase().includes("update") || l.action.toLowerCase().includes("convert")
  ).length;

  const getActionBadge = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("create")) {
      return {
        label: "Created",
        badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
      };
    }
    if (act.includes("convert")) {
      return {
        label: "Converted",
        badge: "bg-purple-100 text-purple-800 border-purple-300",
      };
    }
    if (act.includes("delete") || act.includes("remove")) {
      return {
        label: "Deleted",
        badge: "bg-rose-100 text-rose-800 border-rose-300",
      };
    }
    if (act.includes("update") || act.includes("edit")) {
      return {
        label: "Updated",
        badge: "bg-amber-100 text-amber-800 border-amber-300",
      };
    }
    return {
      label: action,
      badge: "bg-slate-100 text-slate-800 border-slate-300",
    };
  };

  const getEntityBadge = (entity: string) => {
    switch (entity.toLowerCase()) {
      case "lead":
        return "bg-sky-50 text-sky-700 border-sky-300";
      case "client":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "project":
        return "bg-purple-50 text-purple-700 border-purple-300";
      case "task":
        return "bg-blue-50 text-blue-700 border-blue-300";
      case "expense":
        return "bg-rose-50 text-rose-700 border-rose-300";
      case "invoice":
        return "bg-indigo-50 text-indigo-700 border-indigo-300";
      case "client_payment":
        return "bg-teal-50 text-teal-700 border-teal-300";
      case "vendor":
      case "vendor_bill":
        return "bg-orange-50 text-orange-700 border-orange-300";
      case "user":
      case "user_role":
        return "bg-pink-50 text-pink-700 border-pink-300";
      default:
        return "bg-slate-50 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#1E293B] rounded-2xl p-4 shadow-pop">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-100 border-2 border-[#1E293B] text-violet-700">
              <History className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Tracked Operations
              </p>
              <p className="text-2xl font-black text-[#1E293B]">{totalEntries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-[#1E293B] rounded-2xl p-4 shadow-pop">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-100 border-2 border-[#1E293B] text-sky-700">
              <User className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Active Contributors
              </p>
              <p className="text-2xl font-black text-[#1E293B]">{uniqueUsersCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-[#1E293B] rounded-2xl p-4 shadow-pop">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 border-2 border-[#1E293B] text-emerald-700">
              <Sparkles className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Records Created
              </p>
              <p className="text-2xl font-black text-[#1E293B]">{creationsCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-[#1E293B] rounded-2xl p-4 shadow-pop">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 border-2 border-[#1E293B] text-amber-700">
              <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Updates & Conversions
              </p>
              <p className="text-2xl font-black text-[#1E293B]">{updatesCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border-2 border-[#1E293B] shadow-pop space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by person name, email, data type, or record..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border-2 border-[#1E293B] bg-[#FFFDF5] focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Filter by Person */}
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-slate-500 shrink-0" />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              aria-label="Filter by Person"
              className="px-3 py-2 text-xs font-bold rounded-xl border-2 border-[#1E293B] bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All Persons ({users.length})</option>
              {users.map((usr) => (
                <option key={usr} value={usr}>
                  {usr}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Data Type / Entity */}
          <div className="flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-slate-500 shrink-0" />
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              aria-label="Filter by Data Type"
              className="px-3 py-2 text-xs font-bold rounded-xl border-2 border-[#1E293B] bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All Data Types ({entities.length})</option>
              {entities.map((ent) => (
                <option key={ent} value={ent}>
                  {ent.replace(/_/g, " ").toUpperCase()} ({logs.filter((l) => l.entity === ent).length})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Action */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-slate-500 shrink-0" />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              aria-label="Filter by Action"
              className="px-3 py-2 text-xs font-bold rounded-xl border-2 border-[#1E293B] bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All Actions</option>
              <option value="create">Created</option>
              <option value="update">Updated</option>
              <option value="convert">Converted</option>
              <option value="delete">Deleted</option>
            </select>
          </div>
        </div>

        {(searchTerm || selectedEntity !== "all" || selectedUser !== "all" || selectedAction !== "all") && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Showing <strong className="text-[#1E293B]">{filteredLogs.length}</strong> of{" "}
              <strong>{logs.length}</strong> logged changes
            </span>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedEntity("all");
                setSelectedUser("all");
                setSelectedAction("all");
              }}
              className="text-xs font-bold text-violet-700 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Audit Activity Table */}
      <div className="bg-white rounded-2xl border-2 border-[#1E293B] shadow-pop overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <History className="h-10 w-10 mx-auto mb-2 stroke-1 text-slate-300" />
            <p className="text-sm font-bold text-[#1E293B]">No activity matching filters</p>
            <p className="text-xs text-slate-400 mt-1">
              Actions performed across the CRM are tracked and will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead>
                <tr className="border-b-2 border-[#1E293B] bg-[#FFFDF5] text-[11px] font-black uppercase text-[#1E293B]">
                  <th className="py-3 px-4">When</th>
                  <th className="py-3 px-4">Person (Actor)</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Data Type</th>
                  <th className="py-3 px-4">Record / Subject</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#1E293B]/10">
                {filteredLogs.map((log) => {
                  const actionMeta = getActionBadge(log.action);
                  const actorName = log.user_name || "System User";
                  const initial = actorName.charAt(0).toUpperCase() || "U";

                  return (
                    <tr key={log.id} className="hover:bg-violet-50/40 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {new Date(log.created_at).toLocaleString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Person / Actor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-violet-100 border-2 border-[#1E293B] flex items-center justify-center text-xs font-black text-violet-800 shrink-0">
                            {initial}
                          </div>
                          <div>
                            <p className="font-black text-[#1E293B] leading-tight">{actorName}</p>
                            <p className="text-[11px] font-medium text-slate-500">
                              {log.user_email || "System"}
                            </p>
                            {log.user_id && (
                              <p className="text-[10px] text-slate-400 font-mono" title={log.user_id}>
                                ID: {log.user_id.length > 18 ? `${log.user_id.slice(0, 14)}...` : log.user_id}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border-2 shadow-pop-sm ${actionMeta.badge}`}
                        >
                          {actionMeta.label}
                        </span>
                      </td>

                      {/* Data Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${getEntityBadge(
                            log.entity
                          )}`}
                        >
                          {log.entity.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Record Title / Summary */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-[#1E293B] truncate">
                          {log.record_title || log.record_id || "—"}
                        </p>
                        {log.record_id && log.record_title && log.record_id !== log.record_title && (
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            ID: {log.record_id}
                          </p>
                        )}
                      </td>

                      {/* Inspection / Details */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setInspectLog(log)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-[#1E293B] bg-[#FFFDF5] border-2 border-[#1E293B] rounded-xl shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Data
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Log Modal / Drawer */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E293B]/50 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white border-2 border-[#1E293B] rounded-3xl shadow-pop-xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-[#1E293B] bg-[#FFFDF5]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-100 border-2 border-[#1E293B]">
                  <FileText className="h-4 w-4 text-violet-700" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1E293B]">
                    Audit Record Details
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    Operation trace: {inspectLog.action.toUpperCase()} on{" "}
                    {inspectLog.entity.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectLog(null)}
                className="p-1.5 rounded-xl border-2 border-[#1E293B] bg-white text-slate-600 hover:bg-slate-100 shadow-pop-sm cursor-pointer"
                aria-label="Close details"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-medium">
              {/* Attribution Banner */}
              <div className="p-3 bg-violet-50/70 border-2 border-violet-200 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-violet-600 tracking-wider">
                    Entered / Performed By
                  </p>
                  <p className="text-sm font-black text-[#1E293B]">
                    {inspectLog.user_name || "System"}
                  </p>
                  <p className="text-xs text-slate-500">{inspectLog.user_email || "system"}</p>
                  {inspectLog.user_id && (
                    <p className="text-[11px] font-mono text-purple-700 font-bold mt-0.5">
                      User ID: {inspectLog.user_id}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Timestamp
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    {new Date(inspectLog.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Record Summary */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Data Type</p>
                  <p className="font-bold text-[#1E293B] uppercase">{inspectLog.entity}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Record ID</p>
                  <p className="font-mono text-slate-600 text-[11px] truncate">
                    {inspectLog.record_id || "—"}
                  </p>
                </div>
              </div>

              {/* Data State Payload */}
              {inspectLog.new_state && (
                <div>
                  <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-100">
                    <p className="font-black text-slate-700 uppercase tracking-wider text-[11px]">
                      Data Entered / New State
                    </p>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      Current
                    </span>
                  </div>
                  <pre className="p-3.5 bg-slate-900 text-emerald-400 rounded-2xl border-2 border-[#1E293B] overflow-x-auto text-[11px] font-mono leading-relaxed">
                    {JSON.stringify(inspectLog.new_state, null, 2)}
                  </pre>
                </div>
              )}

              {/* Previous State Payload (if update/convert) */}
              {inspectLog.previous_state && (
                <div>
                  <div className="flex items-center justify-between pb-1 mb-2 border-b border-slate-100">
                    <p className="font-black text-slate-700 uppercase tracking-wider text-[11px]">
                      Previous State (Before Change)
                    </p>
                    <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                      Prior
                    </span>
                  </div>
                  <pre className="p-3.5 bg-slate-900 text-amber-400 rounded-2xl border-2 border-[#1E293B] overflow-x-auto text-[11px] font-mono leading-relaxed">
                    {JSON.stringify(inspectLog.previous_state, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#FFFDF5] border-t-2 border-[#1E293B] flex justify-end">
              <button
                onClick={() => setInspectLog(null)}
                className="px-4 py-1.5 text-xs font-black text-[#1E293B] bg-white border-2 border-[#1E293B] rounded-xl shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
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

