import { getProjects, getProjectCategories } from "@/lib/crm-db";
import { formatINR, getBudgetHealthBadge, getBudgetHealth } from "@/utils/finance-calc";
import { PieChart, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default async function BudgetsPage() {
  const projectsRaw = await getProjects().catch(() => []);
  const projects = Array.isArray(projectsRaw) ? projectsRaw : [];

  const projectBudgets = await Promise.all(
    projects.map(async (p) => {
      const categoriesRaw = await getProjectCategories(p.id).catch(() => []);
      const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];
      const collectedCash = p.totalCollected ?? 0;
      const totalActualCost = categories.reduce((sum, c) => sum + (c.actual_cost || 0), 0);
      const grossProfit = collectedCash - totalActualCost;
      const utilPct = collectedCash > 0 ? (totalActualCost / collectedCash) * 100 : 0;
      return { project: p, categories, collectedCash, totalActualCost, grossProfit, utilPct };
    })
  );

  // Filter alerts (categories with >= 80% utilization)
  const alerts: Array<{
    projectName: string;
    projectId: string;
    categoryName: string;
    budget: number;
    actual: number;
    utilPct: number;
    status: "healthy" | "warning" | "at_limit" | "over_budget";
  }> = [];

  for (const pb of projectBudgets) {
    for (const c of pb.categories) {
      const actual = c.actual_cost || 0;
      const budget = c.budget || 0;
      const util = budget > 0 ? (actual / budget) * 100 : 0;
      if (util >= 80) {
        alerts.push({
          projectName: pb.project.name,
          projectId: pb.project.id,
          categoryName: c.name,
          budget,
          actual,
          utilPct: util,
          status: getBudgetHealth(actual, budget),
        });
      }
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b-2 border-[#1E293B]/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-yellow-100 border-2 border-[#1E293B]">
              <PieChart className="h-4 w-4 text-amber-700" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-[#1E293B]">
              Budgets & Health Alerts
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">
            Real-time monitoring of project delivery budgets and early warning threshold alerts.
          </p>
        </div>
      </div>

      {/* Critical Alerts Section */}
      {alerts.length > 0 && (
        <div className="rounded-2xl border-2 border-[#1E293B] bg-amber-50/50 p-5 shadow-pop space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-800" strokeWidth={2.5} />
            <h3 className="font-black text-sm uppercase tracking-wider text-[#1E293B]">
              Active Budget Alerts ({alerts.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map((alt, idx) => {
              const badge = getBudgetHealthBadge(alt.status);
              return (
                <div
                  key={idx}
                  className="rounded-xl border-2 border-[#1E293B] bg-white p-3.5 shadow-pop-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-[#1E293B]">{alt.categoryName}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{alt.projectName}</p>
                    <div className="mt-2 text-xs font-bold text-slate-700">
                      <span>{formatINR(alt.actual)}</span> of <span>{formatINR(alt.budget)}</span>
                      <span className="text-rose-700 ml-1 font-black">({alt.utilPct.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/projects/${alt.projectId}?tab=categories`}
                    className="mt-3 text-right text-[11px] font-bold text-[#8B5CF6] hover:underline"
                  >
                    View Project Workspace →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Project Budgets Overview */}
      <div className="space-y-4">
        {projectBudgets.map(({ project, categories, collectedCash, totalActualCost, grossProfit, utilPct }) => (
          <div key={project.id} className="rounded-2xl border-2 border-[#1E293B] bg-white p-5 shadow-pop space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b-2 border-[#1E293B]/10 pb-3">
              <div>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="font-black text-lg text-[#1E293B] hover:underline"
                >
                  {project.name}
                </Link>
                <p className="text-xs text-slate-500 font-semibold">
                  Client: {project.client?.name || "Client"} · Status: {project.status.toUpperCase()}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Collected Cash: </span>
                  <span className="font-black text-emerald-800">{formatINR(collectedCash)}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Actual Cost: </span>
                  <span className="font-black text-rose-700">{formatINR(totalActualCost)}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Gross Profit: </span>
                  <span className={`font-black ${grossProfit < 0 ? 'text-rose-700' : 'text-emerald-800'}`}>
                    {formatINR(grossProfit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Stacked / Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Actual Cost vs Collected Cash</span>
                <span>{utilPct.toFixed(1)}%</span>
              </div>
              <div className="h-3 w-full rounded-full border-2 border-[#1E293B] bg-slate-100 overflow-hidden">
                <div
                  className={`h-full ${utilPct > 100 ? 'bg-rose-500' : utilPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, utilPct)}%` }}
                />
              </div>
            </div>

            {/* Categories Mini-Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {categories.map((c) => {
                const cUtil = c.budget > 0 ? ((c.actual_cost || 0) / c.budget) * 100 : 0;
                return (
                  <div
                    key={c.id}
                    className="rounded-xl border border-[#1E293B] bg-[#FFFDF5] px-3 py-1.5 text-xs flex items-center gap-2"
                  >
                    <span className="font-bold text-[#1E293B]">{c.name}:</span>
                    <span className="text-slate-600 font-medium">{formatINR(c.actual_cost || 0)} / {formatINR(c.budget)}</span>
                    <span className={`font-black text-[10px] ${cUtil > 100 ? 'text-rose-700' : cUtil >= 80 ? 'text-amber-800' : 'text-emerald-700'}`}>
                      ({cUtil.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
