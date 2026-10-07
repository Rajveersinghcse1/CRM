import Link from "next/link";
import {
  getExecutiveDashboardData,
  getProjects,
  getTasks,
} from "@/lib/crm-db";
import {
  getUserRole,
  canMutateSales,
  canMutateProjects,
  canMutateInvoices,
  canLogExpenses,
  canMutateTasks,
} from "@/utils/auth";
import {
  CheckCircle2,
  Clock,
  FolderKanban,
  AlertTriangle,
  Receipt,
  CreditCard,
  UserPlus,
  CheckSquare,
  Activity as ActivityIcon,
  Phone,
  Mail,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { MoneyPosition } from "@/components/money-position";

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export const metadata = {
  title: "Executive Dashboard | WexLogic CRM",
  description: "Executive Business Intelligence & Operational Command Center for WexLogic.",
};

export default async function DashboardPage() {
  const [data, role, allProjects, allTasks] = await Promise.all([
    getExecutiveDashboardData(),
    getUserRole(),
    getProjects(),
    getTasks(),
  ]);

  const canAddLead = canMutateSales(role);
  const canAddProject = canMutateProjects(role);
  const canAddPayment = canMutateInvoices(role);
  const canAddExpense = canLogExpenses(role);
  const canAddTask = canMutateTasks(role);
  const hasAnyQuickAction = canAddLead || canAddProject || canAddPayment || canAddExpense || canAddTask;

  const collectionPct =
    data.totalPipeline > 0
      ? Math.round((data.collectedRevenue / data.totalPipeline) * 100)
      : 0;

  const urgentTasks = allTasks
    .filter((t) => t.status !== "completed" && (t.priority === "urgent" || t.priority === "high"))
    .slice(0, 4);

  const activeProjectsList = allProjects
    .filter((p) => p.status === "active")
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Candy Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Agency Command Center
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Live Operations
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time financial pulse with clean separation between Client Receivables and Project Liquidity.
          </p>
        </div>

        {/* Quick Actions Candy Bar */}
        {hasAnyQuickAction && (
          <div className="flex flex-wrap items-center gap-2">
            {canAddLead && (
              <Link
                href="/dashboard/leads"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 shadow-xs transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5 text-sky-600" />
                <span>+ Lead</span>
              </Link>
            )}
            {canAddProject && (
              <Link
                href="/dashboard/projects"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-purple-600 shadow-xs transition-colors"
              >
                <FolderKanban className="h-3.5 w-3.5 text-purple-600" />
                <span>+ Project</span>
              </Link>
            )}
            {canAddPayment && (
              <Link
                href="/dashboard/payments"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 shadow-xs transition-colors"
              >
                <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                <span>+ Record Payment</span>
              </Link>
            )}
            {canAddExpense && (
              <Link
                href="/dashboard/expenses"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-bold text-rose-800 hover:bg-rose-100 shadow-xs transition-colors"
              >
                <Receipt className="h-3.5 w-3.5 text-rose-600" />
                <span>+ Log Expense</span>
              </Link>
            )}
            {canAddTask && (
              <Link
                href="/dashboard/tasks"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg btn-primary text-xs font-bold"
              >
                <CheckSquare className="h-3.5 w-3.5 text-white" />
                <span>+ Task</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Star Feature: Executive Money Position (Dual Ledger Flow) */}
      <MoneyPosition
        title="Executive Money Position"
        subtitle="Live agency summary: Client Money Still to Collect vs. Company Spending & Unspent Balance"
        contractValue={data.totalPipeline}
        totalCollected={data.collectedRevenue}
        clientPending={data.clientPending}
        totalExpenses={data.projectCosts}
        availableBalance={data.availableBalance}
        expectedProfit={data.expectedProfit}
        expectedMarginPct={data.expectedMarginPct}
      />

      {/* Friendly 4-Step Workflow Explainer Banner */}
      <div className="bg-gradient-to-r from-slate-50 via-indigo-50/30 to-purple-50/20 border border-slate-200/90 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            How The Agency Workflow Operates
          </h3>
          <span className="text-[10px] text-slate-500 font-medium">(Independent Dual-Balance Rule)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
              <span className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-[11px]">1</span>
              <span>Create Project</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Agree on Contract Value with client (e.g. ₹60,000). Not yet company cash until collected.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <span className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-[11px]">2</span>
              <span>Record Payments</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Client pays in parts (e.g. ₹35,000). Increases Collected & Available Balance; reduces Client Pending.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-rose-700 font-bold">
              <span className="h-5 w-5 rounded-full bg-rose-100 flex items-center justify-center text-[11px]">3</span>
              <span>Log Expenses</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Meta Ads, Shoot, Models (e.g. ₹18,000). Reduces Available Balance. Does <strong>NOT</strong> alter client pending!
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-purple-700 font-bold">
              <span className="h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center text-[11px]">4</span>
              <span>Two Balances</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Client owes: <strong>₹25,000</strong>. Available in bank: <strong>₹17,000</strong>. Expected profit: <strong>₹42,000</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Live Budget Alerts Banner (if any category >= 80%) */}
      {data.budgetAlerts.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-rose-100 text-rose-700">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wide">
                Budget Utilization Alerts ({data.budgetAlerts.length})
              </h3>
            </div>
            <Link
              href="/dashboard/budgets"
              className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
            >
              View Budgets &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {data.budgetAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-lg border border-rose-200 shadow-2xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                    {alert.projectName}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      alert.status === "over_budget"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {alert.utilizationPct}% Used
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Category: <strong className="text-slate-700">{alert.categoryName}</strong>
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Spent: {formatINR(alert.actualCost)}</span>
                  <span>Budget: {formatINR(alert.budget)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 3: Main Operations Hub (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Active Projects & Cash Flow */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects Ledger */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Active Projects — Dual Balance Breakdown
                </h3>
              </div>
              <Link
                href="/dashboard/projects"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                All Projects &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {activeProjectsList.map((proj) => {
                const pending = proj.clientPending ?? Math.max(0, (proj.project_value || 0) - (proj.totalCollected || 0));
                const available = proj.availableBalance ?? ((proj.totalCollected || 0) - (proj.totalActualCost || 0));
                const profit = proj.expectedProfit ?? ((proj.project_value || 0) - (proj.totalActualCost || 0));
                const margin = proj.expectedMargin ?? (
                  proj.project_value > 0 ? Math.round((profit / proj.project_value) * 100) : 0
                );
                const collectionProgress =
                  proj.project_value > 0
                    ? Math.min(100, Math.round(((proj.totalCollected || 0) / proj.project_value) * 100))
                    : 0;

                return (
                  <Link
                    key={proj.id}
                    href={`/dashboard/projects/${proj.id}`}
                    className="block p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all hover:border-slate-300 shadow-2xs group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {proj.name}
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {proj.client?.name || "Client"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Contract: <strong className="text-slate-800">{formatINR(proj.project_value)}</strong> • Total Expenses: <strong className="text-rose-600">{formatINR(proj.totalActualCost || 0)}</strong>
                        </p>
                      </div>

                      {/* Financial Badges */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-right">
                          <span className="text-[9px] uppercase font-bold text-amber-700 block">Client Pending</span>
                          <span className="text-xs font-black text-amber-900">{formatINR(pending)}</span>
                        </div>
                        <div className={`px-2.5 py-1 rounded-lg text-right border ${
                          available >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                        }`}>
                          <span className={`text-[9px] uppercase font-bold block ${available >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                            Available Balance
                          </span>
                          <span className={`text-xs font-black ${available >= 0 ? "text-emerald-900" : "text-rose-900"}`}>
                            {formatINR(available)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar for Collected Revenue */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                        <span>Received: {formatINR(proj.totalCollected || 0)} ({collectionProgress}%)</span>
                        <span>Expected Profit: <strong className="text-slate-800">{formatINR(profit)}</strong> ({margin}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${collectionProgress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Client Payments Ledger */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Collections Ledger
                </h3>
              </div>
              <Link
                href="/dashboard/payments"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
              >
                View All Payments &rarr;
              </Link>
            </div>

            {data.recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No client payments recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2">Client / Project</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Method</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recentPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 font-medium">
                        <td className="py-2.5 font-bold text-slate-900">
                          {p.client?.name || "Client"}
                          <div className="text-[11px] font-normal text-slate-400">
                            {p.project?.name || "Project"}
                          </div>
                        </td>
                        <td className="py-2.5 text-slate-500">
                          {p.payment_date}
                        </td>
                        <td className="py-2.5 uppercase font-semibold text-slate-600 text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {p.payment_method}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-black text-emerald-700 text-sm">
                          {formatINR(p.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Urgent Tasks & Operational Activities */}
        <div className="space-y-6">
          {/* Urgent Tasks */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Priority Tasks
                </h3>
              </div>
              <Link
                href="/dashboard/tasks"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                All Tasks &rarr;
              </Link>
            </div>

            {urgentTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No urgent tasks pending.
              </p>
            ) : (
              <div className="space-y-2">
                {urgentTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/60 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        {t.priority}
                      </span>
                      {t.due_date && (
                        <span className="text-[10px] text-slate-400">
                          Due {t.due_date.split("T")[0]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      {t.title}
                    </p>
                    {t.project?.name && (
                      <p className="text-[10px] text-slate-500">
                        {t.project.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Operational Timeline */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ActivityIcon className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Activities
                </h3>
              </div>
              <Link
                href="/dashboard/activities"
                className="text-xs font-semibold text-purple-600 hover:text-purple-800"
              >
                View Log &rarr;
              </Link>
            </div>

            {data.todayActivities.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No activities logged today.
              </p>
            ) : (
              <div className="space-y-2.5">
                {data.todayActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <div className="mt-0.5 p-1 rounded-md bg-purple-50 text-purple-600 shrink-0">
                      {act.type === "call" ? (
                        <Phone className="h-3 w-3" />
                      ) : act.type === "email" ? (
                        <Mail className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 leading-tight">
                        {act.title}
                      </p>
                      {act.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
