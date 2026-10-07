import { getInvoices, getClients, getProjects } from "@/lib/crm-db";
import { getCurrentUserRole, canMutateInvoices } from "@/utils/auth";
import { formatINR } from "@/utils/finance-calc";
import { InvoiceModal, DeleteInvoiceButton } from "./invoice-modal";
import { FileText, Printer } from "lucide-react";
import Link from "next/link";

export default async function InvoicesPage() {
  const [invoices, clients, projects, role] = await Promise.all([
    getInvoices(),
    getClients(),
    getProjects(),
    getCurrentUserRole(),
  ]);

  const canAdd = canMutateInvoices(role);

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalPaid = invoices.reduce((sum, i) => sum + i.amount_paid, 0);
  const totalOutstanding = Math.max(0, totalInvoiced - totalPaid);

  const STATUS_BADGES: Record<string, { bg: string; text: string; border: string }> = {
    draft: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-800 dark:text-slate-300", border: "border-slate-300 dark:border-slate-700" },
    issued: { bg: "bg-blue-100 dark:bg-blue-950/60", text: "text-blue-950 dark:text-blue-300", border: "border-blue-400 dark:border-blue-700" },
    partially_paid: { bg: "bg-amber-100 dark:bg-amber-950/60", text: "text-amber-950 dark:text-amber-300", border: "border-amber-400 dark:border-amber-700" },
    paid: { bg: "bg-emerald-100 dark:bg-emerald-950/60", text: "text-emerald-950 dark:text-emerald-300", border: "border-[#34D399] dark:border-emerald-700" },
    overdue: { bg: "bg-rose-100 dark:bg-rose-950/60", text: "text-rose-950 dark:text-rose-300", border: "border-rose-400 dark:border-rose-700" },
    cancelled: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-500 dark:text-slate-400", border: "border-slate-300 dark:border-slate-700" },
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b-2 border-[#1E293B]/10 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60 border-2 border-[#1E293B] dark:border-slate-700">
              <FileText className="h-4 w-4 text-blue-700 dark:text-blue-300" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-[#1E293B] dark:text-slate-100">
              Client Invoices
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
            Issue client invoices, track milestone billings, and monitor outstanding receivables.
          </p>
        </div>
        {canAdd && <InvoiceModal clients={clients} projects={projects} />}
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-pop">
          <p className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">Total Billed</p>
          <p className="text-2xl font-black text-[#1E293B] dark:text-slate-100 mt-0.5">{formatINR(totalInvoiced)}</p>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-pop">
          <p className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">Total Collected</p>
          <p className="text-2xl font-black text-emerald-800 dark:text-emerald-400 mt-0.5">{formatINR(totalPaid)}</p>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-pop">
          <p className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">Pending Amount</p>
          <p className="text-2xl font-black text-amber-800 dark:text-amber-400 mt-0.5">{formatINR(totalOutstanding)}</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-hidden rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-[#1E293B]/10 dark:divide-slate-800">
            <thead className="bg-[#FFFDF5] dark:bg-slate-800 border-b-2 border-[#1E293B] dark:border-slate-700">
              <tr>
                <th className="py-4 pl-4 pr-3 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200 sm:pl-6">
                  Invoice #
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200">
                  Client
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200">
                  Project
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200">
                  Total Amount
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200">
                  Amount Paid
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200">
                  Due Date
                </th>
                <th className="px-3 py-4 text-right text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200 pr-4">
                  Status
                </th>
                <th className="px-3 py-4 text-center text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200">
                  Print
                </th>
                {canAdd && (
                  <th className="px-3 py-4 text-right text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200 pr-6">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1E293B]/10 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {invoices.map((inv) => {
                const badge = STATUS_BADGES[inv.status] || STATUS_BADGES.issued;
                return (
                  <tr key={inv.id} className="hover:bg-violet-50/40 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-bold text-[#1E293B] dark:text-slate-100 sm:pl-6">
                      {inv.invoice_number}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-bold text-[#1E293B] dark:text-slate-100">
                      <div>{inv.client?.name || "Client"}</div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{inv.client?.company_name}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {inv.project ? (
                        <Link href={`/dashboard/projects/${inv.project_id}`} className="hover:underline text-purple-700 dark:text-purple-400 font-bold">
                          {inv.project.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-black text-[#1E293B] dark:text-slate-100">
                      {formatINR(inv.total)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                      {formatINR(inv.amount_paid)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {new Date(inv.due_date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black border uppercase tracking-wider shadow-pop-sm ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {inv.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-center">
                      <Link
                        href={`/dashboard/invoices/${inv.id}/print`}
                        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 px-2.5 py-1 text-xs font-black text-[#1E293B] dark:text-slate-200 shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer"
                        title="View and download PDF"
                      >
                        <Printer className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                        PDF
                      </Link>
                    </td>
                    {canAdd && (
                      <td className="whitespace-nowrap px-3 py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <InvoiceModal clients={clients} projects={projects} initialData={inv} />
                          <DeleteInvoiceButton id={inv.id} invoiceNumber={inv.invoice_number} />
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={canAdd ? 9 : 8} className="py-12 text-center text-sm font-medium text-slate-400">
                    {canAdd
                      ? 'No client invoices found. Click "Create Invoice" to issue one.'
                      : "No client invoices found."}
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
