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
  Coins,
  CheckCircle2,
  Clock,
  Users,
  FolderKanban,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  CreditCard,
  UserPlus,
  CheckSquare,
  Activity as ActivityIcon,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  DollarSign,
  Briefcase,
  ChevronRight,
  PieChart as PieIcon,
  FileText,
} from "lucide-react";

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

  const isAdmin = role === "admin";
  const canViewFinance = role === "admin" || role === "manager" || role === "sales";
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
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Candy Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b-2 border-[#1E293B]/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#8B5CF6] border-2 border-[#1E293B]" />
            <h2 className="text-3xl font-black tracking-tight text-[#1E293B] font-display">
              WexLogic Command Center
            </h2>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Real-time financial pulse, project margins, and operational timeline for internal WexLogic operations.
          </p>
        </div>

        {/* Quick Actions Candy Bar */}
        {hasAnyQuickAction && (
          <div className="flex flex-wrap items-center gap-2">
            {canAddLead && (
              <Link
                href="/dashboard/leads"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-[#1E293B] bg-white text-xs font-black text-[#1E293B] hover:bg-sky-50 shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all"
              >
                <UserPlus className="h-3.5 w-3.5 text-sky-600" />
                <span>+ Lead</span>
              </Link>
            )}
            {canAddProject && (
              <Link
                href="/dashboard/projects"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-[#1E293B] bg-white text-xs font-black text-[#1E293B] hover:bg-purple-50 shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all"
              >
                <FolderKanban className="h-3.5 w-3.5 text-purple-600" />
                <span>+ Project</span>
              </Link>
            )}
            {canAddPayment && (
              <Link
                href="/dashboard/payments"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-[#1E293B] bg-white text-xs font-black text-[#1E293B] hover:bg-emerald-50 shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all"
              >
                <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                <span>+ Payment</span>
              </Link>
            )}
            {canAddExpense && (
              <Link
                href="/dashboard/expenses"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-[#1E293B] bg-white text-xs font-black text-[#1E293B] hover:bg-rose-50 shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all"
              >
                <Receipt className="h-3.5 w-3.5 text-rose-600" />
                <span>+ Expense</span>
              </Link>
            )}
            {canAddTask && (
              <Link
                href="/dashboard/tasks"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl btn-gold text-xs font-black"
              >
                <CheckSquare className="h-3.5 w-3.5 text-[#1E293B]" />
                <span>+ Task</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Row 1: High-Level Executive KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Contract Pipeline */}
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-5 shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Total Pipeline Value
              </p>
              <p className="mt-2 text-2xl lg:text-3xl font-black text-[#1E293B]">
                {formatINR(data.totalPipeline)}
              </p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                {data.activeProjects} active project{data.activeProjects !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-violet-100 border-2 border-[#1E293B] flex items-center justify-center text-[#8B5CF6] shrink-0 shadow-pop-sm">
              <FolderKanban className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Card 2: Collected Revenue */}
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-5 shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Collected Revenue
              </p>
              <p className="mt-2 text-2xl lg:text-3xl font-black text-emerald-700">
                {formatINR(data.collectedRevenue)}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600">
                  {collectionPct}% of total pipeline
                </span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-100 border-2 border-[#1E293B] flex items-center justify-center text-[#059669] shrink-0 shadow-pop-sm">
              <CheckCircle2 className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Card 3: Total Project Costs (Actuals) */}
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-5 shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Total Actual Costs
              </p>
              <p className="mt-2 text-2xl lg:text-3xl font-black text-rose-700">
                {formatINR(data.projectCosts)}
              </p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                Direct vendor & project expenses
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-rose-100 border-2 border-[#1E293B] flex items-center justify-center text-rose-600 shrink-0 shadow-pop-sm">
              <Receipt className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Card 4: Net Gross Profit & Margin % */}
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-5 shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Gross Profit
                </p>
                <span className="px-1.5 py-0.2 rounded font-black text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {data.grossMarginPct}% Margin
                </span>
              </div>
              <p className="mt-2 text-2xl lg:text-3xl font-black text-[#1E293B]">
                {formatINR(data.grossProfit)}
              </p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                Pending Amount: {formatINR(data.clientReceivables)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-100 border-2 border-[#1E293B] flex items-center justify-center text-amber-700 shrink-0 shadow-pop-sm">
              <TrendingUp className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Live Budget Alerts Banner (if any category >= 80%) */}
      {data.budgetAlerts.length > 0 && (
        <div className="rounded-2xl border-2 border-rose-500 bg-rose-50/70 p-5 shadow-pop space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-rose-200 border border-rose-500 text-rose-700">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="text-base font-black text-rose-950">
                Live Budget Utilization Alerts ({data.budgetAlerts.length})
              </h3>
            </div>
            <Link
              href="/dashboard/budgets"
              className="text-xs font-black text-rose-800 hover:text-rose-950 underline"
            >
              View All Budgets &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.budgetAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border-2 border-[#1E293B] shadow-pop-sm space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#1E293B] truncate max-w-[150px]">
                    {alert.projectName}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                      alert.status === "over_budget"
                        ? "bg-rose-100 text-rose-800 border-rose-400"
                        : "bg-amber-100 text-amber-800 border-amber-400"
                    }`}
                  >
                    {alert.utilizationPct}% Used
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-600">
                  Category: <span className="text-[#1E293B]">{alert.categoryName}</span>
                </p>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1 border-t border-slate-100">
                  <span>Spent: {formatINR(alert.actualCost)}</span>
                  <span>Budget: {formatINR(alert.budget)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 3: Main Operations Hub (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Active Projects & Cash Flow */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Projects Profitability Overview */}
          <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-6 shadow-pop space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#1E293B]/10 pb-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-black text-[#1E293B]">
                  Active Projects & Profit Margins
                </h3>
              </div>
              <Link
                href="/dashboard/projects"
                className="text-xs font-black text-violet-600 hover:text-violet-800"
              >
                All Projects &rarr;
              </Link>
            </div>

            <div className="space-y-4">
              {activeProjectsList.map((proj) => {
                const profit = (proj.project_value || 0) - (proj.totalActualCost || 0);
                const margin =
                  proj.project_value > 0
                    ? Math.round((profit / proj.project_value) * 100)
                    : 0;
                const collectionProgress =
                  proj.project_value > 0
                    ? Math.min(100, Math.round(((proj.totalCollected || 0) / proj.project_value) * 100))
                    : 0;

                return (
                  <Link
                    key={proj.id}
                    href={`/dashboard/projects/${proj.id}`}
                    className="block p-4 rounded-xl border-2 border-[#1E293B] bg-slate-50/60 hover:bg-violet-50/40 transition-all shadow-pop-sm group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-[#1E293B] group-hover:text-violet-700 transition-colors">
                            {proj.name}
                          </h4>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300">
                            {proj.client?.name || "Client"}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                          Contract: <span className="font-bold text-[#1E293B]">{formatINR(proj.project_value)}</span> | Actual Cost: <span className="font-bold text-rose-600">{formatINR(proj.totalActualCost || 0)}</span>
                        </p>
                      </div>

                      <div className="text-right sm:self-auto">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {margin}% Margin ({formatINR(profit)})
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar for Collected Revenue */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                        <span>Collected: {formatINR(proj.totalCollected || 0)}</span>
                        <span>{collectionProgress}% Paid</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden border border-[#1E293B]/20">
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

          {/* Recent Client Payments Stream */}
          <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-6 shadow-pop space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#1E293B]/10 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-black text-[#1E293B]">
                  Recent Client Payments
                </h3>
              </div>
              <Link
                href="/dashboard/payments"
                className="text-xs font-black text-emerald-600 hover:text-emerald-800"
              >
                View All Payments &rarr;
              </Link>
            </div>

            {data.recentPayments.length === 0 ? (
              <p className="text-sm font-semibold text-slate-400 py-6 text-center">
                No payments recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#1E293B] text-xs font-black text-slate-500 uppercase">
                      <th className="py-2">Client / Project</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Method</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recentPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 font-medium text-xs">
                        <td className="py-2.5 font-bold text-[#1E293B]">
                          {p.client?.name || "Client"}
                          <div className="text-[10px] font-normal text-slate-400">
                            {p.project?.name || "Project"}
                          </div>
                        </td>
                        <td className="py-2.5 text-slate-500">
                          {p.payment_date}
                        </td>
                        <td className="py-2.5 uppercase font-bold text-slate-600 text-[10px]">
                          {p.payment_method}
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

        {/* Right Column: Activities, Urgent Tasks, Quick Links */}
        <div className="space-y-8">
          {/* Urgent Tasks */}
          <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-6 shadow-pop space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#1E293B]/10 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-black text-[#1E293B]">
                  Urgent Tasks
                </h3>
              </div>
              <Link
                href="/dashboard/tasks"
                className="text-xs font-black text-blue-600 hover:text-blue-800"
              >
                All Tasks &rarr;
              </Link>
            </div>

            {urgentTasks.length === 0 ? (
              <p className="text-xs font-semibold text-slate-400 py-4 text-center">
                No urgent tasks pending.
              </p>
            ) : (
              <div className="space-y-2.5">
                {urgentTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-xl border-2 border-[#1E293B] bg-slate-50/70 shadow-pop-sm space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                        {t.priority}
                      </span>
                      {t.due_date && (
                        <span className="text-[10px] font-bold text-slate-400">
                          Due {t.due_date.split("T")[0]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-black text-[#1E293B] leading-tight">
                      {t.title}
                    </p>
                    {t.project?.name && (
                      <p className="text-[10px] font-medium text-slate-500">
                        {t.project.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Operational Timeline */}
          <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-6 shadow-pop space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#1E293B]/10 pb-3">
              <div className="flex items-center gap-2">
                <ActivityIcon className="h-5 w-5 text-pink-600" />
                <h3 className="text-lg font-black text-[#1E293B]">
                  Recent Activity
                </h3>
              </div>
              <Link
                href="/dashboard/activities"
                className="text-xs font-black text-pink-600 hover:text-pink-800"
              >
                View Log &rarr;
              </Link>
            </div>

            {data.todayActivities.length === 0 ? (
              <p className="text-xs font-semibold text-slate-400 py-4 text-center">
                No activities logged today.
              </p>
            ) : (
              <div className="space-y-3">
                {data.todayActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="mt-0.5 p-1 rounded-md bg-pink-100 border border-pink-300 text-pink-700 shrink-0">
                      {act.type === "call" ? (
                        <Phone className="h-3 w-3" />
                      ) : act.type === "email" ? (
                        <Mail className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#1E293B] leading-tight">
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
