import { getExpenses, getProjects, getVendors } from "@/lib/crm-db";
import { getCurrentUserRole, canLogExpenses } from "@/utils/auth";
import { formatINR } from "@/utils/finance-calc";
import { ExpenseModal, DeleteExpenseButton } from "./expense-modal";
import { Receipt } from "lucide-react";
import Link from "next/link";

export default async function ExpensesPage() {
  const [expenses, projects, vendors, role] = await Promise.all([
    getExpenses(),
    getProjects(),
    getVendors(),
    getCurrentUserRole(),
  ]);

  const canAdd = canLogExpenses(role);

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b-2 border-[#1E293B]/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-rose-100 border-2 border-[#1E293B]">
              <Receipt className="h-4 w-4 text-rose-700" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-[#1E293B]">
              Operational Expenses
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">
            Internal expenditures, production costs, and vendor settlements tied to projects.
          </p>
        </div>
        {canAdd && <ExpenseModal projects={projects} vendors={vendors} />}
      </div>

      {/* Summary Strip */}
      <div className="flex items-center gap-4 rounded-2xl border-2 border-[#1E293B] bg-white p-5 shadow-pop">
        <div className="h-12 w-12 rounded-2xl bg-rose-100 border-2 border-[#1E293B] flex items-center justify-center text-rose-800 shrink-0 shadow-pop-sm">
          <Receipt className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">
            Total Actual Cost Logged
          </p>
          <p className="text-3xl font-black text-rose-700 mt-0.5">
            {formatINR(totalSpent)}
          </p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-hidden rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-[#1E293B]/10">
            <thead className="bg-[#FFFDF5] border-b-2 border-[#1E293B]">
              <tr>
                <th className="py-4 pl-4 pr-3 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] sm:pl-6">
                  Expense Description
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Project
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Category
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Vendor
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Amount
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Date
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Status
                </th>
                {canAdd && (
                  <th className="px-3 py-4 text-right text-xs font-black uppercase tracking-wider text-[#1E293B] pr-6">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1E293B]/10 bg-white">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-violet-50/40 transition-colors">
                  <td className="py-4 pl-4 pr-3 sm:pl-6 max-w-xs">
                    <p className="text-xs sm:text-sm font-bold text-[#1E293B] leading-snug">
                      {exp.description}
                    </p>
                    {exp.notes && (
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-0.5">
                        {exp.notes}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs font-semibold text-slate-600">
                    {exp.project ? (
                      <Link href={`/dashboard/projects/${exp.project_id}`} className="hover:underline text-purple-700">
                        {exp.project.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs font-semibold text-slate-700">
                    <span className="rounded-lg bg-violet-50 border border-violet-200 px-2 py-0.5 text-xs font-bold text-[#8B5CF6]">
                      {exp.category?.name || "General"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs font-medium text-slate-600">
                    {exp.vendor?.name || "Direct / Internal"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs font-black text-rose-700">
                    {formatINR(exp.amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs font-medium text-slate-500">
                    {new Date(exp.expense_date).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <span className="rounded-full bg-emerald-100 border border-[#34D399] px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-950">
                      {exp.payment_status}
                    </span>
                  </td>
                  {canAdd && (
                    <td className="whitespace-nowrap px-3 py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <ExpenseModal projects={projects} vendors={vendors} initialData={exp} />
                        <DeleteExpenseButton id={exp.id} description={exp.description} projectId={exp.project_id} />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={canAdd ? 8 : 7} className="py-12 text-center text-sm font-medium text-slate-400">
                    {canAdd
                      ? 'No operational expenses recorded. Click "Add Expense" to log one.'
                      : "No operational expenses recorded."}
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
