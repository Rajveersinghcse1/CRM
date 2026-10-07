import {
  getClientById,
  getProjects,
  getInvoices,
  getClientPayments,
  getActivities,
} from "@/lib/crm-db";
import { formatINR } from "@/utils/finance-calc";
import { getCurrentUserRole, canMutateInvoices } from "@/utils/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Users,
  ArrowLeft,
  FolderKanban,
  FileText,
  CreditCard,
  Activity,
  Coins,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  const [allProjects, allInvoices, allPayments, allActivities, role] = await Promise.all([
    getProjects(),
    getInvoices(client.id),
    getClientPayments(client.id),
    getActivities({ clientId: client.id }),
    getCurrentUserRole(),
  ]);

  const canInvoice = canMutateInvoices(role);
  const clientProjects = allProjects.filter((p) => p.client_id === client.id);

  // Financial calculations
  const totalRevenue = clientProjects.reduce((sum, p) => sum + p.project_value, 0);
  const totalCollected = allPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const totalOutstanding = Math.max(0, totalRevenue - totalCollected);
  const totalCosts = clientProjects.reduce((sum, p) => sum + (p.totalActualCost || 0), 0);
  const totalProfit = totalRevenue - totalCosts;
  const grossMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 font-sans">
      {/* Top Breadcrumb / Back */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#1E293B] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-bold text-[#1E293B] dark:text-slate-200 shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Clients
        </Link>
        <span className="text-slate-400 dark:text-slate-600">/</span>
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{client.name}</span>
      </div>

      {/* Client Header Card */}
      <div className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-pop">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 border-2 border-[#1E293B] dark:border-emerald-700/60 flex items-center justify-center text-xl font-black text-emerald-800 dark:text-emerald-300 shadow-pop-sm shrink-0">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-[#1E293B] dark:text-slate-100">{client.name}</h1>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-3 py-0.5 text-xs font-black text-emerald-950 dark:text-emerald-300 border border-[#34D399] dark:border-emerald-700/60">
                  {client.status.toUpperCase()}
                </span>
                {client.tags?.map((t) => (
                  <span key={t} className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
                {client.company_name} {client.designation ? `· ${client.designation}` : ""}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                {client.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /> {client.email}
                  </span>
                )}
                {client.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /> {client.phone}
                  </span>
                )}
                {client.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /> {client.city}, {client.state || "India"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {canInvoice && (
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/invoices`}
                className="rounded-full border-2 border-[#1E293B] dark:border-purple-500/40 bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 py-1.5 text-xs font-bold text-white shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
              >
                + Create Invoice
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Client 360° Financial KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-pop">
          <p className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">Total Contract Value</p>
          <p className="text-xl font-black text-[#1E293B] dark:text-slate-100 mt-0.5">{formatINR(totalRevenue)}</p>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-pop">
          <p className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">Collected Cash</p>
          <p className="text-xl font-black text-emerald-800 dark:text-emerald-400 mt-0.5">{formatINR(totalCollected)}</p>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-pop">
          <p className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">Pending Amount</p>
          <p className="text-xl font-black text-amber-800 dark:text-amber-400 mt-0.5">{formatINR(totalOutstanding)}</p>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-pop">
          <p className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">Gross Profit</p>
          <p className="text-xl font-black text-[#8B5CF6] dark:text-purple-400 mt-0.5">{formatINR(totalProfit)}</p>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-pop">
          <p className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">Gross Margin %</p>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{grossMargin}%</p>
        </div>
      </div>

      {/* Sections: Projects, Invoices, Payments, Activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Projects Table */}
        <div className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop overflow-hidden">
          <div className="p-4 border-b-2 border-[#1E293B] dark:border-slate-800 bg-[#FFFDF5] dark:bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-purple-700 dark:text-purple-400" strokeWidth={2.5} />
              <h3 className="font-black text-xs uppercase tracking-wider text-[#1E293B] dark:text-slate-200">
                Active Projects ({clientProjects.length})
              </h3>
            </div>
            <Link href="/dashboard/projects" className="text-xs font-bold text-[#8B5CF6] dark:text-purple-400 hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y-2 divide-[#1E293B]/10 dark:divide-slate-800">
            {clientProjects.map((p) => (
              <div key={p.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between">
                <div>
                  <Link href={`/dashboard/projects/${p.id}`} className="font-bold text-sm text-[#1E293B] dark:text-slate-100 hover:underline">
                    {p.name}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{p.status.toUpperCase()} · Budget: {formatINR(p.overall_budget)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#1E293B] dark:text-slate-100">{formatINR(p.project_value)}</p>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-800/60">
                    Profit: {formatINR(p.grossProfit || 0)}
                  </span>
                </div>
              </div>
            ))}
            {clientProjects.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">No projects yet.</div>
            )}
          </div>
        </div>

        {/* Client Invoices & Payments */}
        <div className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop overflow-hidden">
          <div className="p-4 border-b-2 border-[#1E293B] dark:border-slate-800 bg-[#FFFDF5] dark:bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-700 dark:text-blue-400" strokeWidth={2.5} />
              <h3 className="font-black text-xs uppercase tracking-wider text-[#1E293B] dark:text-slate-200">
                Invoices & Payments ({allInvoices.length})
              </h3>
            </div>
            {canInvoice && (
              <Link href="/dashboard/payments" className="text-xs font-bold text-[#8B5CF6] dark:text-purple-400 hover:underline">
                Log Payment
              </Link>
            )}
          </div>
          <div className="divide-y-2 divide-[#1E293B]/10 dark:divide-slate-800">
            {allInvoices.map((inv) => (
              <div key={inv.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-[#1E293B] dark:text-slate-100">{inv.invoice_number}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    Due: {new Date(inv.due_date).toLocaleDateString()} · Status: {inv.status.toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#1E293B] dark:text-slate-100">{formatINR(inv.total)}</p>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Paid: {formatINR(inv.amount_paid)}</p>
                </div>
              </div>
            ))}
            {allInvoices.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">No invoices issued yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
