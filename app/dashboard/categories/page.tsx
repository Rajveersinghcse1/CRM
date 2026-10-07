import { getProjects, getProjectCategories } from "@/lib/crm-db";
import { getCurrentUserRole, canMutateProjects } from "@/utils/auth";
import { formatINR, getBudgetHealthBadge } from "@/utils/finance-calc";
import { CategoryModal, DeleteCategoryButton } from "@/app/dashboard/projects/[id]/category-modal";
import { Tags, FolderKanban } from "lucide-react";
import Link from "next/link";

export default async function CategoriesPage() {
  const [projects, role] = await Promise.all([
    getProjects(),
    getCurrentUserRole(),
  ]);

  const canAdd = canMutateProjects(role);

  const allProjectCategories = await Promise.all(
    projects.map(async (p) => {
      const cats = await getProjectCategories(p.id);
      return { project: p, categories: cats };
    })
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b-2 border-[#1E293B]/10 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-teal-100 dark:bg-teal-950/60 border-2 border-[#1E293B] dark:border-slate-700">
              <Tags className="h-4 w-4 text-teal-700 dark:text-teal-400" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-[#1E293B] dark:text-slate-100">
              Project Categories & Cost Centers
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
            Company-wide monitoring of internal work categories, allocated budgets, and expenditure utilization.
          </p>
        </div>
        <Link
          href="/dashboard/projects"
          className="rounded-full border-2 border-[#1E293B] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-[#1E293B] dark:text-slate-200 shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
        >
          View All Projects
        </Link>
      </div>

      {/* Categories by Project */}
      <div className="space-y-6">
        {allProjectCategories.map(({ project, categories }) => (
          <div key={project.id} className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop overflow-hidden">
            <div className="p-4 border-b-2 border-[#1E293B] dark:border-slate-800 bg-[#FFFDF5] dark:bg-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FolderKanban className="h-4 w-4 text-purple-700 dark:text-purple-400" strokeWidth={2.5} />
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="font-black text-sm text-[#1E293B] dark:text-slate-100 hover:underline"
                >
                  {project.name}
                </Link>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  (Client: {project.client?.name || "Client"})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-[#1E293B] dark:text-slate-200">
                  Budget: {formatINR(project.overall_budget)}
                </span>
                <Link
                  href={`/dashboard/projects/${project.id}?tab=categories`}
                  className="rounded-full border border-[#1E293B] dark:border-slate-700 bg-violet-50 dark:bg-violet-950/60 px-3 py-0.5 text-xs font-bold text-[#8B5CF6] dark:text-purple-300 hover:bg-violet-100 dark:hover:bg-violet-900/60"
                >
                  Manage Categories →
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y-2 divide-[#1E293B]/10 dark:divide-slate-800">
                <thead className="bg-[#FFFDF5] dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 pl-4 pr-3 text-left text-[11px] font-black uppercase text-[#1E293B] dark:text-slate-300 sm:pl-6">
                      Category
                    </th>
                    <th className="px-3 py-3 text-left text-[11px] font-black uppercase text-[#1E293B] dark:text-slate-300">
                      Allocated Budget
                    </th>
                    <th className="px-3 py-3 text-left text-[11px] font-black uppercase text-[#1E293B] dark:text-slate-300">
                      Actual Cost
                    </th>
                    <th className="px-3 py-3 text-left text-[11px] font-black uppercase text-[#1E293B] dark:text-slate-300">
                      Remaining
                    </th>
                    <th className="px-3 py-3 text-left text-[11px] font-black uppercase text-[#1E293B] dark:text-slate-300">
                      Utilization
                    </th>
                    <th className="px-3 py-3 text-left text-[11px] font-black uppercase text-[#1E293B] dark:text-slate-300">
                      Health
                    </th>
                    {canAdd && (
                      <th className="px-3 py-3 text-right text-[11px] font-black uppercase text-[#1E293B] dark:text-slate-300 pr-6">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#1E293B]/10 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {categories.map((cat) => {
                    const actual = cat.actual_cost || 0;
                    const budget = cat.budget || 0;
                    const remaining = budget - actual;
                    const util = budget > 0 ? (actual / budget) * 100 : 0;
                    const healthStatus = actual > budget ? "over_budget" : actual === budget ? "at_limit" : util >= 80 ? "warning" : "healthy";
                    const badge = getBudgetHealthBadge(healthStatus);

                    return (
                      <tr key={cat.id} className="hover:bg-violet-50/40 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="whitespace-nowrap py-3 pl-4 pr-3 text-xs font-bold text-[#1E293B] dark:text-slate-100 sm:pl-6">
                          {cat.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-xs font-black text-[#1E293B] dark:text-slate-100">
                          {formatINR(budget)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-xs font-bold text-rose-700 dark:text-rose-400">
                          {formatINR(actual)}
                        </td>
                        <td className={`whitespace-nowrap px-3 py-3 text-xs font-bold ${remaining < 0 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {formatINR(remaining)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-xs font-black text-[#1E293B] dark:text-slate-100">
                          {util.toFixed(1)}%
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black border uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        {canAdd && (
                          <td className="whitespace-nowrap px-3 py-3 text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              <CategoryModal projectId={project.id} initialData={cat} />
                              <DeleteCategoryButton id={cat.id} name={cat.name} projectId={project.id} />
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={canAdd ? 7 : 6} className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                        No categories configured for this project.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
