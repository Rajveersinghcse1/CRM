import {
  getProjectById,
  getProjectCategories,
  getExpenses,
  getInvoices,
  getClientPayments,
  getTasks,
  getVendors,
  getClients,
} from "@/lib/crm-db";
import { formatINR, getBudgetHealthBadge } from "@/utils/finance-calc";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FolderKanban,
  Receipt,
  Tags,
  CheckSquare,
  FileText,
  CreditCard,
  Printer,
  Sparkles,
  Wallet,
  Building2,
  Calendar,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  getCurrentUserRole,
  canMutateProjects,
  canLogExpenses,
  canMutateInvoices,
  canMutateTasks,
} from "@/utils/auth";
import { ProjectModal, DeleteProjectButton } from "../project-modal";
import { CategoryModal, DeleteCategoryButton } from "./category-modal";
import { ProjectExpenseModal, DeleteProjectExpenseButton } from "./project-expense-modal";
import { InvoiceModal, DeleteInvoiceButton } from "@/app/dashboard/invoices/invoice-modal";
import { PaymentModal, DeletePaymentButton } from "@/app/dashboard/payments/payment-modal";
import { TaskModal, DeleteTaskButton } from "@/app/dashboard/tasks/task-modal";
import { MoneyPosition } from "@/components/money-position";

export default async function ProjectWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "overview" } = await searchParams;

  const [project, categories, expenses, invoices, payments, tasks, vendors, clients, role] = await Promise.all([
    getProjectById(id),
    getProjectCategories(id),
    getExpenses(id),
    getInvoices(undefined, id),
    getClientPayments(undefined, id),
    getTasks(id),
    getVendors(),
    getClients(),
    getCurrentUserRole(),
  ]);

  if (!project) {
    notFound();
  }

  const canAddCategory = canMutateProjects(role);
  const canAddExpense = canLogExpenses(role);
  const canAddPayment = canMutateInvoices(role);
  const canAddTask = canMutateTasks(role);

  // Exact Financial Formulas from Specification (todo.md)
  const contractValue = project.project_value;
  const totalActualCost = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalCollected = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const clientPending = Math.max(0, contractValue - totalCollected);
  const availableBalance = totalCollected - totalActualCost;
  const expectedProfit = contractValue - totalActualCost;
  const expectedMarginPct =
    contractValue > 0 ? Math.round(((contractValue - totalActualCost) / contractValue) * 100) : 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 shadow-2xs transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Projects</span>
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-bold text-slate-900">{project.name}</span>
      </div>

      {/* Project Command Header Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-700 shadow-2xs shrink-0">
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{project.name}</h1>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  {project.status.toUpperCase()}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
                  {project.project_code || "PRJ"}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Client:{" "}
                <Link
                  href={`/dashboard/clients/${project.client_id}`}
                  className="text-indigo-600 hover:underline font-bold"
                >
                  {project.client?.name || "Client Account"}
                </Link>
                {project.client?.company_name ? ` (${project.client.company_name})` : ""}
              </p>
              {project.description && (
                <p className="text-xs text-slate-500 mt-1 max-w-2xl font-normal leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions Candy Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/dashboard/projects/${project.id}/quotation`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all"
              title="Generate & Download Quotation PDF"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Quotation PDF</span>
            </Link>

            {canAddPayment && (
              <PaymentModal clients={clients} projects={[project]} invoices={invoices} />
            )}

            {canAddExpense && (
              <ProjectExpenseModal
                projectId={project.id}
                clientId={project.client_id}
                categories={categories}
                vendors={vendors}
              />
            )}

            {canAddCategory && (
              <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-200">
                <ProjectModal clients={clients} initialData={project} />
                <DeleteProjectButton id={project.id} name={project.name} redirectUrl="/dashboard/projects" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prominent Money Position Widget */}
      <MoneyPosition
        title={`${project.name} — Money Position`}
        subtitle="Independent separation between Client Receivables (Inbound) and Project Liquidity (Outbound)"
        contractValue={contractValue}
        totalCollected={totalCollected}
        clientPending={clientPending}
        totalExpenses={totalActualCost}
        availableBalance={availableBalance}
        expectedProfit={expectedProfit}
        expectedMarginPct={expectedMarginPct}
      />

      {/* Tabs Header Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <Link
          href={`/dashboard/projects/${project.id}?tab=overview`}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
            tab === "overview"
              ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs"
              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
          }`}
        >
          <Wallet className="h-3.5 w-3.5" />
          <span>Overview</span>
        </Link>
        <Link
          href={`/dashboard/projects/${project.id}?tab=payments`}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
            tab === "payments"
              ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs"
              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span>Client Payments ({payments.length})</span>
        </Link>
        <Link
          href={`/dashboard/projects/${project.id}?tab=expenses`}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
            tab === "expenses"
              ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs"
              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
          }`}
        >
          <Receipt className="h-3.5 w-3.5" />
          <span>Expenses Ledger ({expenses.length})</span>
        </Link>
        <Link
          href={`/dashboard/projects/${project.id}?tab=categories`}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
            tab === "categories"
              ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs"
              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
          }`}
        >
          <Tags className="h-3.5 w-3.5" />
          <span>Budget Categories ({categories.length})</span>
        </Link>
        <Link
          href={`/dashboard/projects/${project.id}?tab=invoices`}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
            tab === "invoices"
              ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs"
              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Invoices ({invoices.length})</span>
        </Link>
        <Link
          href={`/dashboard/projects/${project.id}?tab=tasks`}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
            tab === "tasks"
              ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs"
              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
          }`}
        >
          <CheckSquare className="h-3.5 w-3.5" />
          <span>Tasks ({tasks.length})</span>
        </Link>
      </div>

      {/* TAB: OVERVIEW */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Quick Ledger Snapshot Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Client Collections Snapshot */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Collections & Receipts ({payments.length})
                  </h3>
                </div>
                {canAddPayment && (
                  <PaymentModal clients={clients} projects={[project]} invoices={invoices} />
                )}
              </div>

              {payments.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No client payments received yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {payments.slice(0, 4).map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{p.notes || p.payment_number || "Payment"}</p>
                        <p className="text-[11px] text-slate-400">{p.payment_date} • {p.payment_method.toUpperCase()}</p>
                      </div>
                      <span className="font-black text-emerald-700">+{formatINR(p.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Total Collected:</span>
                <span className="font-black text-emerald-700">{formatINR(totalCollected)}</span>
              </div>
            </div>

            {/* Expenses Snapshot */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-rose-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Project Expenses Logged ({expenses.length})
                  </h3>
                </div>
                {canAddExpense && (
                  <ProjectExpenseModal
                    projectId={project.id}
                    clientId={project.client_id}
                    categories={categories}
                    vendors={vendors}
                  />
                )}
              </div>

              {expenses.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No project expenses logged yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {expenses.slice(0, 4).map((e) => (
                    <div key={e.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{e.description}</p>
                        <p className="text-[11px] text-slate-400">
                          {e.category?.name || "General"} • {e.expense_date}
                        </p>
                      </div>
                      <span className="font-black text-rose-700">{formatINR(e.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Total Expenses:</span>
                <span className="font-black text-rose-700">{formatINR(totalActualCost)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CLIENT PAYMENTS (COLLECTIONS LEDGER) */}
      {tab === "payments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-emerald-700 shrink-0" />
              <p className="text-xs text-emerald-950 font-medium">
                Client Payments Ledger: Every payment increases <strong>Collected Cash</strong> & <strong>Available Balance</strong>, and directly decreases <strong>Client Pending</strong>.
              </p>
            </div>
            {canAddPayment && (
              <PaymentModal clients={clients} projects={[project]} invoices={invoices} />
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 pl-5 pr-3 text-left">Receipt / Note</th>
                    <th className="px-3 py-3.5 text-left">Payment Date</th>
                    <th className="px-3 py-3.5 text-left">Method</th>
                    <th className="px-3 py-3.5 text-left">Reference Number</th>
                    <th className="px-3 py-3.5 text-right font-black">Amount</th>
                    <th className="px-3 py-3.5 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 pl-5 pr-3 font-bold text-slate-900">
                        {p.notes || p.payment_number || "Payment Milestone"}
                        {p.payment_number && (
                          <div className="text-[10px] text-slate-400 font-normal">{p.payment_number}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-slate-600">
                        {p.payment_date}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 uppercase font-bold text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-slate-500">
                        {p.reference_number || "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-right font-black text-emerald-700 text-sm">
                        +{formatINR(p.amount)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-right pr-5">
                        {canAddPayment && (
                          <div className="flex items-center justify-end gap-1.5">
                            <PaymentModal clients={clients} projects={[project]} invoices={invoices} initialData={p} />
                            <DeletePaymentButton id={p.id} paymentNumber={p.payment_number || undefined} />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                        No payments received yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PROJECT EXPENSES LEDGER */}
      {tab === "expenses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-rose-50/60 border border-rose-200 rounded-xl p-3.5">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-rose-700 shrink-0" />
              <p className="text-xs text-rose-950 font-medium">
                Categorized Project Expenses: Spends draw directly from collected funds to calculate <strong>Available Balance</strong>. They do <strong>NOT</strong> modify what the client owes!
              </p>
            </div>
            {canAddExpense && (
              <ProjectExpenseModal
                projectId={project.id}
                clientId={project.client_id}
                categories={categories}
                vendors={vendors}
              />
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 pl-5 pr-3 text-left">Description</th>
                    <th className="px-3 py-3.5 text-left">Category</th>
                    <th className="px-3 py-3.5 text-left">Vendor / Paid To</th>
                    <th className="px-3 py-3.5 text-left">Date</th>
                    <th className="px-3 py-3.5 text-right font-black">Amount</th>
                    <th className="px-3 py-3.5 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 pl-5 pr-3 max-w-xs font-bold text-slate-900">
                        {exp.description}
                        {exp.notes && (
                          <p className="text-[11px] text-slate-400 font-normal mt-0.5">{exp.notes}</p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5">
                        <span className="rounded-md bg-purple-50 border border-purple-200/80 px-2 py-0.5 text-xs font-bold text-purple-700">
                          {exp.category?.name || "General"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-slate-600">
                        {exp.vendor?.name || "Direct / Vendor"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-slate-500">
                        {new Date(exp.expense_date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-right font-black text-rose-700 text-sm">
                        {formatINR(exp.amount)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-right pr-5">
                        {canAddExpense && (
                          <div className="flex items-center justify-end gap-1.5">
                            <ProjectExpenseModal
                              projectId={project.id}
                              clientId={project.client_id}
                              categories={categories}
                              vendors={vendors}
                              initialData={exp}
                            />
                            <DeleteProjectExpenseButton id={exp.id} description={exp.description} projectId={project.id} />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                        No expenses logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: WORK CATEGORIES & BUDGET ALLOCATION */}
      {tab === "categories" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Internal allocation of client contract value into categories and real-time utilization.
            </p>
            {canAddCategory && <CategoryModal projectId={project.id} />}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 pl-5 pr-3 text-left">Category Name</th>
                    <th className="px-3 py-3.5 text-left">Budget</th>
                    <th className="px-3 py-3.5 text-left">Actual Cost</th>
                    <th className="px-3 py-3.5 text-left">Remaining</th>
                    <th className="px-3 py-3.5 text-left">Utilization %</th>
                    <th className="px-3 py-3.5 text-center">Status</th>
                    <th className="px-3 py-3.5 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {categories.map((cat) => {
                    const actual = cat.actual_cost || 0;
                    const budget = cat.budget || 0;
                    const remaining = budget - actual;
                    const util = budget > 0 ? (actual / budget) * 100 : 0;
                    const healthStatus = actual > budget ? "over_budget" : actual === budget ? "at_limit" : util >= 80 ? "warning" : "healthy";
                    const badge = getBudgetHealthBadge(healthStatus);

                    return (
                      <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="whitespace-nowrap py-3.5 pl-5 pr-3 font-bold text-slate-900">
                          {cat.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 font-bold text-slate-800">
                          {formatINR(budget)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 font-bold text-rose-700">
                          {formatINR(actual)}
                        </td>
                        <td className={`whitespace-nowrap px-3 py-3.5 font-bold ${remaining < 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                          {formatINR(remaining)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span>{util.toFixed(1)}%</span>
                            <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full ${util > 100 ? 'bg-rose-500' : util >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, util)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-right pr-5">
                          {canAddCategory && (
                            <div className="flex items-center justify-end gap-1.5">
                              <CategoryModal projectId={project.id} initialData={cat} />
                              <DeleteCategoryButton id={cat.id} name={cat.name} projectId={project.id} />
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                        No work categories created yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: INVOICES */}
      {tab === "invoices" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">Invoices generated for client billing.</p>
            {canMutateInvoices(role) && (
              <InvoiceModal clients={clients} projects={[project]} />
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100 text-xs">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{inv.invoice_number}</p>
                    <p className="text-slate-500 mt-0.5">Due: {new Date(inv.due_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <p className="text-sm font-black text-slate-900">{formatINR(inv.total)}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Paid: {formatINR(inv.amount_paid)}
                      </span>
                      <Link
                        href={`/dashboard/invoices/${inv.id}/print`}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 transition-colors"
                        title="Print / View Invoice PDF"
                      >
                        <Printer className="h-3 w-3" />
                        PDF
                      </Link>
                      {canMutateInvoices(role) && (
                        <>
                          <InvoiceModal clients={clients} projects={[project]} initialData={inv} />
                          <DeleteInvoiceButton id={inv.id} invoiceNumber={inv.invoice_number} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {invoices.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">No invoices issued for this project.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: TASKS */}
      {tab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">Deliverables and action items.</p>
            {canAddTask && (
              <TaskModal projects={[project]} />
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100 text-xs">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        task.status === "completed" ? "bg-emerald-500" : "bg-amber-400"
                      }`}
                    />
                    <div>
                      <h4 className="font-bold text-slate-900">{task.title}</h4>
                      <p className="text-slate-400 mt-0.5">
                        Category: {task.category?.name || "General"} • Priority: {task.priority.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                      {task.status.replace("_", " ")}
                    </span>
                    {canAddTask && (
                      <div className="flex items-center gap-1">
                        <TaskModal projects={[project]} initialData={task} />
                        <DeleteTaskButton id={task.id} name={task.title} projectId={project.id} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">No tasks logged for this project yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
