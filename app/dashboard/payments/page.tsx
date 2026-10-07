import { getClientPayments, getClients, getProjects, getInvoices } from "@/lib/crm-db";
import { getCurrentUserRole, canMutateInvoices } from "@/utils/auth";
import { formatINR } from "@/utils/finance-calc";
import { PaymentModal, DeletePaymentButton } from "./payment-modal";
import { CreditCard, CheckCircle2, Info } from "lucide-react";
import Link from "next/link";

export default async function PaymentsPage() {
  const [paymentsRaw, clientsRaw, projectsRaw, invoicesRaw, role] = await Promise.all([
    getClientPayments().catch(() => []),
    getClients().catch(() => []),
    getProjects().catch(() => []),
    getInvoices().catch(() => []),
    getCurrentUserRole().catch(() => "employee" as const),
  ]);

  const payments = Array.isArray(paymentsRaw) ? paymentsRaw : [];
  const clients = Array.isArray(clientsRaw) ? clientsRaw : [];
  const projects = Array.isArray(projectsRaw) ? projectsRaw : [];
  const invoices = Array.isArray(invoicesRaw) ? invoicesRaw : [];
  const canAdd = canMutateInvoices(role);

  const totalCollected = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700">
              <CreditCard className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Client Payments & Collections Ledger
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {payments.length} Receipts
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Record client milestones and advances. Increases available liquidity and reduces client pending.
          </p>
        </div>
        {canAdd && <PaymentModal clients={clients} projects={projects} invoices={invoices} />}
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Client Revenue Collected
          </p>
          <p className="text-2xl font-black text-emerald-700">
            {formatINR(totalCollected)}
          </p>
          <p className="text-[11px] text-slate-400">Total received across all projects in bank & cash</p>
        </div>

        <div className="md:col-span-2 bg-emerald-50/50 border border-emerald-200/70 rounded-2xl p-5 flex items-start gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
            <Info className="h-4 w-4" />
          </div>
          <div className="space-y-1 text-xs text-emerald-950">
            <h3 className="font-bold">Client Inflow Mechanism</h3>
            <p className="text-emerald-800 leading-relaxed text-[11px]">
              Every payment logged against a project directly increases <strong>Collected Cash</strong> and <strong>Available Unspent Balance</strong>, while decrementing <strong>Client Pending</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            All Receipts & Collections ({payments.length})
          </span>
          <span className="text-[11px] text-slate-400">Verified transaction receipts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3 text-left">Payment # / Notes</th>
                <th className="px-3 py-3.5 text-left">Client</th>
                <th className="px-3 py-3.5 text-left">Project</th>
                <th className="px-3 py-3.5 text-right font-black">Amount</th>
                <th className="px-3 py-3.5 text-left">Method & Ref</th>
                <th className="px-3 py-3.5 text-left">Date</th>
                <th className="px-3 py-3.5 text-center">Status</th>
                {canAdd && (
                  <th className="px-3 py-3.5 text-right pr-5">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="whitespace-nowrap py-3.5 pl-5 pr-3 font-bold text-slate-900">
                    <div>{p.notes || p.payment_number || "Payment Milestone"}</div>
                    {p.payment_number && (
                      <span className="text-[10px] text-slate-400 font-normal">{p.payment_number}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-700">
                    <div className="font-semibold">{p.client?.name || "Client"}</div>
                    <span className="text-[10px] text-slate-400 font-normal">{p.client?.company_name}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-600">
                    {p.project ? (
                      <Link href={`/dashboard/projects/${p.project_id}`} className="hover:underline font-semibold text-indigo-600">
                        {p.project.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right font-black text-emerald-700 text-sm">
                    +{formatINR(p.amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold uppercase">
                      {p.payment_method}
                    </span>
                    {p.reference_number && <div className="text-[10px] text-slate-400 mt-0.5">{p.reference_number}</div>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-500">
                    {new Date(p.payment_date).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-center">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      p.status === "completed"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : p.status === "pending"
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-slate-100 border-slate-200 text-slate-700"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  {canAdd && (
                    <td className="whitespace-nowrap px-3 py-3.5 text-right pr-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <PaymentModal
                          clients={clients}
                          projects={projects}
                          invoices={invoices}
                          initialData={p}
                        />
                        <DeletePaymentButton id={p.id} paymentNumber={p.payment_number || undefined} />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    No client payments recorded yet. Click "+ Record Payment" to log an inflow.
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
