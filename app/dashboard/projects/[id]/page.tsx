import {
  getProjectById,
  getProjectCategories,
  getExpenses,
  getInvoices,
  getClientPayments,
  getTasks,
  getVendors,
} from "@/lib/crm-db";
import { formatINR, getBudgetHealthBadge } from "@/utils/finance-calc";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  FolderKanban,
  ArrowLeft,
  Coins,
  CheckCircle,
  Clock,
  TrendingUp,
  Receipt,
  Tags,
  CheckSquare,
  FileText,
  CreditCard,
  AlertTriangle,
  Printer,
} from "lucide-react";
import {
  getCurrentUserRole,
  canMutateProjects,
  canLogExpenses,
  canMutateInvoices,
  canMutateTasks,
} from "@/utils/auth";
import { CategoryModal } from "./category-modal";
import { ProjectExpenseModal } from "./project-expense-modal";

export default async function ProjectWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "categories" } = await searchParams;

  const [project, categories, expenses, invoices, payments, tasks, vendors, role] = await Promise.all([
    getProjectById(id),
    getProjectCategories(id),
    getExpenses(id),
    getInvoices(undefined, id),
    getClientPayments(undefined, id),
    getTasks(id),
    getVendors(),
    getCurrentUserRole(),
  ]);

  if (!project) {
    notFound();
  }

  const canAddCategory = canMutateProjects(role);
  const canAddExpense = canLogExpenses(role);
  const canAddPayment = canMutateInvoices(role);
  const canAddTask = canMutateTasks(role);

  // Exact Financial Formulas from Specification
  const contractValue = project.project_value;
  const overallBudget = project.overall_budget;
  const totalActualCost = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalCollected = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const totalOutstanding = Math.max(0, contractValue - totalCollected);
  const remainingBudget = overallBudget - totalActualCost;
  const grossProfit = contractValue - totalActualCost;
  const grossMarginPct = contractValue > 0 ? ((grossProfit / contractValue) * 100).toFixed(1) : "0.0";
  const overallUtilizationPct = overallBudget > 0 ? ((totalActualCost / overallBudget) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 font-sans">
      {/* Breadcrumb / Top Navigation */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#1E293B] bg-white px-3 py-1 text-xs font-bold text-[#1E293B] shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Projects
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-xs font-bold text-slate-600">{project.name}</span>
      </div>

      {/* Project Command Header Card */}
      <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-6 shadow-pop">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-purple-100 border-2 border-[#1E293B] flex items-center justify-center text-xl font-black text-purple-800 shadow-pop-sm shrink-0">
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-[#1E293B]">{project.name}</h1>
                <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-black text-emerald-950 border border-[#34D399]">
                  {project.status.toUpperCase()}
                </span>
                <span className="rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                  {project.project_code || "PRJ"}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-600 mt-1">
                Client:{" "}
                <Link
                  href={`/dashboard/clients/${project.client_id}`}
                  className="text-[#8B5CF6] hover:underline"
                >
                  {project.client?.name || "Client Account"}
                </Link>
                {project.client?.company_name ? ` (${project.client.company_name})` : ""}
              </p>
              {project.description && (
                <p className="text-xs text-slate-500 mt-1 max-w-2xl font-medium">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions Candy Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/dashboard/projects/${project.id}/quotation`}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#1E293B] bg-amber-50 px-3.5 py-2 text-xs font-black text-[#1E293B] shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer"
              title="Generate & Download Quotation PDF"
            >
              <Printer className="h-4 w-4 text-amber-700" strokeWidth={2.5} />
              Quotation PDF
            </Link>
            {canAddCategory && <CategoryModal projectId={project.id} />}
            {canAddExpense && (
              <ProjectExpenseModal
                projectId={project.id}
                clientId={project.client_id}
                categories={categories}
                vendors={vendors}
              />
            )}
          </div>
        </div>
      </div>

      {/* Row 1: Executive Financial KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-3.5 shadow-pop">
          <p className="text-[10px] font-black uppercase text-slate-500">Contract Value</p>
          <p className="text-base lg:text-lg font-black text-[#1E293B] mt-0.5">{formatINR(contractValue)}</p>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-3.5 shadow-pop">
          <p className="text-[10px] font-black uppercase text-slate-500">Collected Cash</p>
          <p className="text-base lg:text-lg font-black text-emerald-800 mt-0.5">{formatINR(totalCollected)}</p>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-3.5 shadow-pop">
          <p className="text-[10px] font-black uppercase text-slate-500">Outstanding</p>
          <p className="text-base lg:text-lg font-black text-amber-800 mt-0.5">{formatINR(totalOutstanding)}</p>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-3.5 shadow-pop">
          <p className="text-[10px] font-black uppercase text-slate-500">Total Budget</p>
          <p className="text-base lg:text-lg font-black text-[#1E293B] mt-0.5">{formatINR(overallBudget)}</p>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-3.5 shadow-pop">
          <p className="text-[10px] font-black uppercase text-slate-500">Actual Cost</p>
          <p className="text-base lg:text-lg font-black text-rose-700 mt-0.5">{formatINR(totalActualCost)}</p>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-3.5 shadow-pop">
          <p className="text-[10px] font-black uppercase text-slate-500">Budget Left</p>
          <p className={`text-base lg:text-lg font-black mt-0.5 ${remainingBudget < 0 ? 'text-rose-700' : 'text-slate-700'}`}>
            {formatINR(remainingBudget)}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-3.5 shadow-pop">
          <p className="text-[10px] font-black uppercase text-slate-500">Gross Profit</p>
          <p className="text-base lg:text-lg font-black text-emerald-800 mt-0.5">{formatINR(grossProfit)}</p>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-3.5 shadow-pop">
          <p className="text-[10px] font-black uppercase text-slate-500">Gross Margin</p>
          <p className="text-base lg:text-lg font-black text-[#8B5CF6] mt-0.5">{grossMarginPct}%</p>
        </div>
      </div>

      {/* Tabs Header Navigation */}
      <div className="flex items-center gap-2 border-b-2 border-[#1E293B]/10 overflow-x-auto pb-1">
        <Link
          href={`/dashboard/projects/${project.id}?tab=categories`}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full border-2 transition-all ${
            tab === "categories"
              ? "bg-violet-100 text-[#1E293B] border-[#1E293B] shadow-pop-sm"
              : "border-transparent text-slate-600 hover:border-[#1E293B] hover:bg-slate-50"
          }`}
        >
          <Tags className="h-3.5 w-3.5" />
          <span>Work Categories & Budgets ({categories.length})</span>
        </Link>
        <Link
          href={`/dashboard/projects/${project.id}?tab=expenses`}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full border-2 transition-all ${
            tab === "expenses"
              ? "bg-violet-100 text-[#1E293B] border-[#1E293B] shadow-pop-sm"
              : "border-transparent text-slate-600 hover:border-[#1E293B] hover:bg-slate-50"
          }`}
        >
          <Receipt className="h-3.5 w-3.5" />
          <span>Actual Costs & Bills ({expenses.length})</span>
        </Link>
        <Link
          href={`/dashboard/projects/${project.id}?tab=invoices`}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full border-2 transition-all ${
            tab === "invoices"
              ? "bg-violet-100 text-[#1E293B] border-[#1E293B] shadow-pop-sm"
              : "border-transparent text-slate-600 hover:border-[#1E293B] hover:bg-slate-50"
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span>Client Invoices & Payments ({invoices.length})</span>
        </Link>
        <Link
          href={`/dashboard/projects/${project.id}?tab=tasks`}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full border-2 transition-all ${
            tab === "tasks"
              ? "bg-violet-100 text-[#1E293B] border-[#1E293B] shadow-pop-sm"
              : "border-transparent text-slate-600 hover:border-[#1E293B] hover:bg-slate-50"
          }`}
        >
          <CheckSquare className="h-3.5 w-3.5" />
          <span>Tasks & Deliverables ({tasks.length})</span>
        </Link>
      </div>

      {/* TAB 1: WORK CATEGORIES & BUDGET ALLOCATION */}
      {tab === "categories" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">
              Internal allocation of client contract value into work categories and actual cost tracking.
            </p>
            {canAddCategory && <CategoryModal projectId={project.id} />}
          </div>

          <div className="overflow-hidden rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y-2 divide-[#1E293B]/10">
                <thead className="bg-[#FFFDF5] border-b-2 border-[#1E293B]">
                  <tr>
                    <th className="py-4 pl-4 pr-3 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] sm:pl-6">
                      Category Name
                    </th>
                    <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                      Allocated Budget
                    </th>
                    <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                      Actual Cost
                    </th>
                    <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                      Remaining
                    </th>
                    <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                      Utilization %
                    </th>
                    <th className="px-3 py-4 text-right text-xs font-black uppercase tracking-wider text-[#1E293B] pr-6">
                      Budget Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#1E293B]/10 bg-white">
                  {categories.map((cat) => {
                    const actual = cat.actual_cost || 0;
                    const budget = cat.budget || 0;
                    const remaining = budget - actual;
                    const util = budget > 0 ? (actual / budget) * 100 : 0;
                    const healthStatus = actual > budget ? "over_budget" : actual === budget ? "at_limit" : util >= 80 ? "warning" : "healthy";
                    const badge = getBudgetHealthBadge(healthStatus);

                    return (
                      <tr key={cat.id} className="hover:bg-violet-50/40 transition-colors">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-[#1E293B] sm:pl-6">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6] border border-[#1E293B]" />
                            <span>{cat.name}</span>
                          </div>
                          {cat.subcategories && cat.subcategories.length > 0 && (
                            <div className="mt-1 pl-4 text-[11px] text-slate-500 font-medium">
                              Sub-items: {cat.subcategories.map((s) => s.name).join(", ")}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-xs font-black text-[#1E293B]">
                          {formatINR(budget)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-xs font-bold text-rose-700">
                          {formatINR(actual)}
                        </td>
                        <td className={`whitespace-nowrap px-3 py-4 text-xs font-bold ${remaining < 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                          {formatINR(remaining)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-xs font-black text-[#1E293B]">
                          <div className="flex items-center gap-2">
                            <span>{util.toFixed(1)}%</span>
                            <div className="h-2 w-16 rounded-full border border-[#1E293B] bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full ${util > 100 ? 'bg-rose-500' : util >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, util)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-right pr-6">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black border uppercase tracking-wider shadow-pop-sm ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm font-medium text-slate-400">
                        {canAddCategory
                          ? 'No work categories allocated yet. Click "Add Category" to partition project budget.'
                          : "No work categories allocated yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTUAL EXPENSES & BILLS */}
      {tab === "expenses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">
              Detailed breakdown of actual bills, contractor fees, and operational costs under this project.
            </p>
            {canAddExpense && (
              <ProjectExpenseModal
                projectId={project.id}
                clientId={project.client_id}
                categories={categories}
                vendors={vendors}
              />
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y-2 divide-[#1E293B]/10">
                <thead className="bg-[#FFFDF5] border-b-2 border-[#1E293B]">
                  <tr>
                    <th className="py-4 pl-4 pr-3 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] sm:pl-6">
                      Expense Description
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
                      Date & Bill Ref
                    </th>
                    <th className="px-3 py-4 text-right text-xs font-black uppercase tracking-wider text-[#1E293B] pr-6">
                      Payment Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#1E293B]/10 bg-white">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-violet-50/40 transition-colors">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-[#1E293B] sm:pl-6">
                        {exp.description}
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
                        <div>{new Date(exp.expense_date).toLocaleDateString()}</div>
                        {exp.bill_number && <div className="text-[10px] text-slate-400 font-semibold">{exp.bill_number}</div>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-right pr-6">
                        <span className="rounded-full bg-emerald-100 border border-[#34D399] px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-950">
                          {exp.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm font-medium text-slate-400">
                        {canAddExpense
                          ? 'No expenses logged yet. Click "Log Expense" to record costs.'
                          : "No expenses logged yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INVOICES & PAYMENTS */}
      {tab === "invoices" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Invoices List */}
            <div className="rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop overflow-hidden">
              <div className="p-4 border-b-2 border-[#1E293B] bg-[#FFFDF5] flex items-center justify-between">
                <h3 className="font-black text-xs uppercase tracking-wider text-[#1E293B]">
                  Client Invoices ({invoices.length})
                </h3>
                <Link href="/dashboard/invoices" className="text-xs font-bold text-[#8B5CF6] hover:underline">
                  Manage Invoices
                </Link>
              </div>
              <div className="divide-y-2 divide-[#1E293B]/10">
                {invoices.map((inv) => (
                  <div key={inv.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-[#1E293B]">{inv.invoice_number}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">Due: {new Date(inv.due_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="text-sm font-black text-[#1E293B]">{formatINR(inv.total)}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300">
                          Paid: {formatINR(inv.amount_paid)}
                        </span>
                        <Link
                          href={`/dashboard/invoices/${inv.id}/print`}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 transition-colors"
                          title="Print / View Invoice PDF"
                        >
                          <Printer className="h-3 w-3" />
                          PDF
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {invoices.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400 font-medium">No invoices issued for this project.</div>
                )}
              </div>
            </div>

            {/* Collected Payments */}
            <div className="rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop overflow-hidden">
              <div className="p-4 border-b-2 border-[#1E293B] bg-[#FFFDF5] flex items-center justify-between">
                <h3 className="font-black text-xs uppercase tracking-wider text-[#1E293B]">
                  Recorded Cash Receipts ({payments.length})
                </h3>
                {canAddPayment && (
                  <Link href="/dashboard/payments" className="text-xs font-bold text-[#8B5CF6] hover:underline">
                    + Log Payment
                  </Link>
                )}
              </div>
              <div className="divide-y-2 divide-[#1E293B]/10">
                {payments.map((p) => (
                  <div key={p.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-emerald-800">{p.payment_number || "Payment"}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {new Date(p.payment_date).toLocaleDateString()} · {p.payment_method.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-700">+{formatINR(p.amount)}</p>
                      <span className="text-[10px] font-bold text-slate-500">{p.reference_number || "Verified"}</span>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400 font-medium">No payments received yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TASKS & DELIVERABLES */}
      {tab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">
              Operational to-dos and milestone deliverables linked to work categories.
            </p>
            {canAddTask && (
              <Link
                href="/dashboard/tasks"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#1E293B] bg-[#8B5CF6] px-3.5 py-1.5 text-xs font-bold text-white shadow-pop"
              >
                + Create Task
              </Link>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop">
            <div className="divide-y-2 divide-[#1E293B]/10">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-violet-50/40 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full border border-[#1E293B] ${
                        task.status === "completed" ? "bg-[#34D399]" : "bg-amber-400"
                      }`}
                    />
                    <div>
                      <h4 className="font-bold text-sm text-[#1E293B]">{task.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Category: {task.category?.name || "General"} · Priority: {task.priority.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-[10px] font-black uppercase text-slate-700">
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">No tasks logged for this project yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
