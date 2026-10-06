import { getProjects, getClients } from "@/lib/crm-db";
import { getCurrentUserRole, canMutateProjects } from "@/utils/auth";
import { formatINR } from "@/utils/finance-calc";
import { ProjectModal, DeleteProjectButton } from "./project-modal";
import { FolderKanban, ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function ProjectsPage() {
  const [projects, clients, role] = await Promise.all([
    getProjects(),
    getClients(),
    getCurrentUserRole(),
  ]);

  const canAdd = canMutateProjects(role);

  const totalContractValue = projects.reduce((sum, p) => sum + p.project_value, 0);
  const totalCollectedCash = projects.reduce((sum, p) => sum + (p.totalCollected || 0), 0);
  const totalOutstanding = projects.reduce((sum, p) => sum + (p.totalOutstanding ?? Math.max(0, p.project_value - (p.totalCollected || 0))), 0);
  const totalActualCost = projects.reduce((sum, p) => sum + (p.totalActualCost || 0), 0);
  const totalGrossProfit = totalCollectedCash - totalActualCost;
  const overallMargin = totalCollectedCash > 0 ? ((totalGrossProfit / totalCollectedCash) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b-2 border-[#1E293B]/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-purple-100 border-2 border-[#1E293B]">
              <FolderKanban className="h-4 w-4 text-purple-700" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-[#1E293B]">
              Projects Hub
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">
            Client contract values, collected cash, pending amounts, actual costs, gross profits, and gross margins.
          </p>
        </div>
        {canAdd && <ProjectModal clients={clients} />}
      </div>

      {/* Financial Overview Strip according to project KPI rules */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-3.5 shadow-pop flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500">Contract Value</p>
            <p className="text-xl sm:text-2xl font-black text-[#1E293B] mt-0.5">{formatINR(totalContractValue)}</p>
          </div>
          <span className="text-[9px] font-bold text-slate-400 mt-1">Deal Close Total</span>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-3.5 shadow-pop flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500">Collected Cash</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-800 mt-0.5">{formatINR(totalCollectedCash)}</p>
          </div>
          <span className="text-[9px] font-bold text-emerald-700 mt-1">Cash In Hand</span>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-3.5 shadow-pop flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500">Pending Amount</p>
            <p className="text-xl sm:text-2xl font-black text-amber-800 mt-0.5">{formatINR(totalOutstanding)}</p>
          </div>
          <span className="text-[9px] font-bold text-slate-500 mt-1">Contract − Collected</span>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-3.5 shadow-pop flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500">Actual Cost</p>
            <p className="text-xl sm:text-2xl font-black text-rose-700 mt-0.5">{formatINR(totalActualCost)}</p>
          </div>
          <span className="text-[9px] font-bold text-rose-700 mt-1">Total Expenses</span>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-3.5 shadow-pop flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500">Gross Profit</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-800 mt-0.5">{formatINR(totalGrossProfit)}</p>
          </div>
          <span className="text-[9px] font-bold text-slate-500 mt-1">Collected − Cost</span>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-3.5 shadow-pop flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500">Gross Margin %</p>
            <p className="text-xl sm:text-2xl font-black text-[#8B5CF6] mt-0.5">{overallMargin}%</p>
          </div>
          <span className="text-[9px] font-bold text-purple-700 mt-1">Profit / Collected</span>
        </div>
      </div>

      {/* Projects List Card */}
      <div className="overflow-hidden rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-[#1E293B]/10">
            <thead className="bg-[#FFFDF5] border-b-2 border-[#1E293B]">
              <tr>
                <th className="py-4 pl-4 pr-3 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] sm:pl-6">
                  Project Code & Name
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Client
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Contract Value
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Collected Cash
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Pending Amount
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Actual Cost
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Gross Profit
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Margin
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Status
                </th>
                <th className="px-3 py-4 text-right text-xs font-black uppercase tracking-wider text-[#1E293B] pr-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1E293B]/10 bg-white">
              {projects.map((proj) => {
                const collected = proj.totalCollected || 0;
                const outstanding = proj.totalOutstanding ?? Math.max(0, proj.project_value - collected);
                const actualCost = proj.totalActualCost || 0;
                const grossProfit = proj.grossProfit ?? (collected - actualCost);
                const grossMargin = proj.grossMargin ?? (collected > 0 ? (grossProfit / collected) * 100 : 0);

                return (
                  <tr key={proj.id} className="hover:bg-violet-50/40 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-[#1E293B] sm:pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-purple-100 border-2 border-[#1E293B] flex items-center justify-center text-xs font-black text-purple-800 shrink-0">
                          {proj.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/dashboard/projects/${proj.id}`} className="hover:underline text-[#1E293B] font-bold">
                            {proj.name}
                          </Link>
                          <p className="text-[11px] text-slate-500 font-semibold">{proj.project_code || "PRJ"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-semibold text-slate-700">
                      <div>{proj.client?.name || "Client"}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{proj.client?.company_name}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-black text-[#1E293B]">
                      {formatINR(proj.project_value)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-bold text-emerald-800">
                      {formatINR(collected)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-bold text-amber-800">
                      {formatINR(outstanding)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-bold text-rose-700">
                      {formatINR(actualCost)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-black text-emerald-800">
                      {formatINR(grossProfit)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-black text-emerald-700">
                      {grossMargin.toFixed(1)}%
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs">
                      <span className="rounded-full bg-emerald-100 border border-[#34D399] px-2.5 py-0.5 font-black uppercase text-emerald-950 text-[10px]">
                        {proj.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/projects/${proj.id}`}
                          className="inline-flex items-center gap-1 rounded-full border border-[#1E293B] bg-[#FFFDF5] px-3 py-1 text-xs font-bold text-[#1E293B] shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
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
                  <td colSpan={10} className="py-12 text-center text-sm font-medium text-slate-400">
                    {canAdd
                      ? 'No projects found. Click "Create Project" to launch your first project.'
                      : "No projects found."}
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
