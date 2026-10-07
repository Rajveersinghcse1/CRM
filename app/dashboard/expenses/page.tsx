import { getExpenses, getProjects, getVendors } from "@/lib/crm-db";
import { getCurrentUserRole, canLogExpenses } from "@/utils/auth";
import { formatINR } from "@/utils/finance-calc";
import { ExpenseModal, DeleteExpenseButton } from "./expense-modal";
import { Receipt, Info, ArrowUpRight } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-700">
              <Receipt className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Company & Project Expenses
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {expenses.length} Records
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Categorized project expenditures (Meta ads, shoot, models, vendors) drawn from collected cash.
          </p>
        </div>
        {canAdd && <ExpenseModal projects={projects} vendors={vendors} />}
      </div>

      {/* Accounting Guidance & Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Project Expenses Logged
          </p>
          <p className="text-2xl font-black text-rose-700">
            {formatINR(totalSpent)}
          </p>
          <p className="text-[11px] text-slate-400">Total spent across all active projects</p>
        </div>

        <div className="md:col-span-2 bg-rose-50/50 border border-rose-200/70 rounded-2xl p-5 flex items-start gap-3">
          <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0">
            <Info className="h-4 w-4" />
          </div>
          <div className="space-y-1 text-xs text-rose-950">
            <h3 className="font-bold">Independent Dual-Balance Principle</h3>
            <p className="text-rose-800 leading-relaxed text-[11px]">
              Project expenses reduce your <strong>Available Unspent Balance</strong>. They do <strong>not</strong> affect what the client owes (Client Pending). Spending money never accidentally inflates the client receivable!
            </p>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Categorized Expense Ledger ({expenses.length})
          </span>
          <span className="text-[11px] text-slate-400">Live operational cost ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3 text-left">Expense Description</th>
                <th className="px-3 py-3.5 text-left">Project</th>
                <th className="px-3 py-3.5 text-left">Category</th>
                <th className="px-3 py-3.5 text-left">Paid To / Vendor</th>
                <th className="px-3 py-3.5 text-right font-black">Amount</th>
                <th className="px-3 py-3.5 text-left">Date</th>
                <th className="px-3 py-3.5 text-center">Status</th>
                {canAdd && (
                  <th className="px-3 py-3.5 text-right pr-5">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 pl-5 pr-3 max-w-xs font-bold text-slate-900">
                    {exp.description}
                    {exp.notes && (
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5 line-clamp-1">
                        {exp.notes}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-700">
                    {exp.project ? (
                      <Link href={`/dashboard/projects/${exp.project_id}`} className="hover:underline font-semibold text-indigo-600">
                        {exp.project.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <span className="rounded-md bg-purple-50 border border-purple-200/80 px-2 py-0.5 text-xs font-bold text-purple-700">
                      {exp.category?.name || "General"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-600">
                    {exp.vendor?.name || "Direct / Internal"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right font-black text-rose-700 text-sm">
                    {formatINR(exp.amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-500">
                    {new Date(exp.expense_date).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-center">
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                      {exp.payment_status}
                    </span>
                  </td>
                  {canAdd && (
                    <td className="whitespace-nowrap px-3 py-3.5 text-right pr-5">
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
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    No expenses logged yet. Click "+ Log Expense" to record costs.
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
