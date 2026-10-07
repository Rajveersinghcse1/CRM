import { getProjects, getClients } from "@/lib/crm-db";
import { getCurrentUserRole, canMutateProjects } from "@/utils/auth";
import { formatINR } from "@/utils/finance-calc";
import { ProjectModal, DeleteProjectButton } from "./project-modal";
import { FolderKanban, ArrowUpRight, TrendingUp, Wallet, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";
import { MoneyPosition } from "@/components/money-position";

export default async function ProjectsPage() {
  const [projectsRaw, clientsRaw, role] = await Promise.all([
    getProjects().catch(() => []),
    getClients().catch(() => []),
    getCurrentUserRole().catch(() => "employee" as const),
  ]);

  const projects = Array.isArray(projectsRaw) ? projectsRaw : [];
  const clients = Array.isArray(clientsRaw) ? clientsRaw : [];
  const canAdd = canMutateProjects(role);

  const totalContractValue = projects.reduce((sum, p) => sum + (Number(p.project_value) || 0), 0);
  const totalCollectedCash = projects.reduce((sum, p) => sum + (Number(p.totalCollected) || 0), 0);
  const totalClientPending = projects.reduce((sum, p) => sum + (p.clientPending ?? Math.max(0, (Number(p.project_value) || 0) - (Number(p.totalCollected) || 0))), 0);
  const totalExpenses = projects.reduce((sum, p) => sum + (Number(p.totalActualCost) || 0), 0);
  const totalAvailableBalance = totalCollectedCash - totalExpenses;
  const totalExpectedProfit = totalContractValue - totalExpenses;
  const overallMargin = totalContractValue > 0 ? Math.round(((totalExpectedProfit / totalContractValue) * 100)) : 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
              <FolderKanban className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Projects Hub
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {projects.length} Total
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Client contracts, collections ledger, pending amounts, categorized expenses, and available liquidity.
          </p>
        </div>
        {canAdd && <ProjectModal clients={clients} />}
      </div>

      {/* Top Money Position Summary */}
      <MoneyPosition
        title="Agency Portfolio Money Position"
        subtitle="Consolidated dual-balance view across all agency projects"
        contractValue={totalContractValue}
        totalCollected={totalCollectedCash}
        clientPending={totalClientPending}
        totalExpenses={totalExpenses}
        availableBalance={totalAvailableBalance}
        expectedProfit={totalExpectedProfit}
        expectedMarginPct={overallMargin}
      />

      {/* Projects List Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Projects Directory ({projects.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Client Pending vs Available Balance per project
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3 text-left">Project Name</th>
                <th className="px-3 py-3.5 text-left">Client</th>
                <th className="px-3 py-3.5 text-left">Contract Value</th>
                <th className="px-3 py-3.5 text-left">Collected</th>
                <th className="px-3 py-3.5 text-left">Client Pending</th>
                <th className="px-3 py-3.5 text-left">Expenses</th>
                <th className="px-3 py-3.5 text-left">Available Balance</th>
                <th className="px-3 py-3.5 text-left">Expected Profit</th>
                <th className="px-3 py-3.5 text-center">Status</th>
                <th className="px-3 py-3.5 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {projects.map((proj) => {
                const collected = proj.totalCollected || 0;
                const pending = proj.clientPending ?? Math.max(0, (proj.project_value || 0) - collected);
                const expenses = proj.totalActualCost || 0;
                const available = proj.availableBalance ?? (collected - expenses);
                const profit = proj.expectedProfit ?? ((proj.project_value || 0) - expenses);
                const margin = proj.expectedMargin ?? (
                  proj.project_value > 0 ? Math.round((profit / proj.project_value) * 100) : 0
                );

                return (
                  <tr key={proj.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="whitespace-nowrap py-3.5 pl-5 pr-3 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                          {proj.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/dashboard/projects/${proj.id}`} className="hover:underline hover:text-indigo-600 font-bold">
                            {proj.name}
                          </Link>
                          <p className="text-[10px] text-slate-400 font-semibold">{proj.project_code || "PRJ"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-slate-700">
                      <div className="font-semibold">{proj.client?.name || "Client"}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{proj.client?.company_name}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-bold text-slate-900">
                      {formatINR(proj.project_value)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-bold text-emerald-700">
                      {formatINR(collected)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5">
                      <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-amber-50 text-amber-800 border border-amber-200">
                        {formatINR(pending)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-bold text-rose-700">
                      {formatINR(expenses)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${
                        available >= 0
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-rose-50 text-rose-800 border-rose-200"
                      }`}>
                        {formatINR(available)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-bold text-slate-900">
                      <div>{formatINR(profit)}</div>
                      <span className="text-[10px] text-slate-400 font-medium">{margin}% Margin</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-center">
                      <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 font-bold uppercase text-slate-700 text-[10px]">
                        {proj.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-right pr-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/projects/${proj.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 shadow-2xs transition-all"
                        >
                          <span>Workspace</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                        {canAdd && (
                          <>
                            <ProjectModal clients={clients} initialData={proj} />
                            <DeleteProjectButton id={proj.id} name={proj.name} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-slate-400">
                    No projects found. Click "Create Project" to launch your first project.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
