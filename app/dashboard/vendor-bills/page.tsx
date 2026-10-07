import { getVendorBills, getVendors, getProjects } from "@/lib/crm-db";
import { getCurrentUserRole, canMutateVendors } from "@/utils/auth";
import { formatINR } from "@/utils/finance-calc";
import { VendorBillModal, DeleteVendorBillButton } from "./vendor-bill-modal";
import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";

export default async function VendorBillsPage() {
  const [bills, vendors, projects, role] = await Promise.all([
    getVendorBills(),
    getVendors(),
    getProjects(),
    getCurrentUserRole(),
  ]);

  const canAdd = canMutateVendors(role);

  const totalOwed = bills
    .filter((b) => b.payment_status !== "paid")
    .reduce((sum, b) => sum + Number(b.total_amount), 0);

  const STATUS_BADGES: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: "bg-amber-100", text: "text-amber-950", border: "border-amber-400" },
    partially_paid: { bg: "bg-blue-100", text: "text-blue-950", border: "border-blue-400" },
    paid: { bg: "bg-emerald-100", text: "text-emerald-950", border: "border-[#34D399]" },
    overdue: { bg: "bg-rose-100", text: "text-rose-950", border: "border-rose-400" },
    cancelled: { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-300" },
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b-2 border-[#1E293B]/10 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 border-2 border-[#1E293B] dark:border-slate-700">
              <FileSpreadsheet className="h-4 w-4 text-orange-700 dark:text-orange-400" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-[#1E293B] dark:text-slate-100">
              Vendor Bills (Accounts Payable)
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
            Track external invoices owed to vendors, suppliers, and freelancers (separate from client billing).
          </p>
        </div>
        {canAdd && <VendorBillModal vendors={vendors} projects={projects} />}
      </div>

      {/* Summary Card */}
      <div className="flex items-center gap-4 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-pop">
        <div className="h-12 w-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 border-2 border-[#1E293B] dark:border-slate-700 flex items-center justify-center text-orange-800 dark:text-orange-300 shrink-0 shadow-pop-sm">
          <FileSpreadsheet className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Pending Vendor Payables
          </p>
          <p className="text-3xl font-black text-orange-800 dark:text-orange-400 mt-0.5">
            {formatINR(totalOwed)}
          </p>
        </div>
      </div>

      {/* Vendor Bills Table */}
      <div className="overflow-hidden rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-[#1E293B]/10 dark:divide-slate-800">
            <thead className="bg-[#FFFDF5] dark:bg-slate-800/80 border-b-2 border-[#1E293B] dark:border-slate-800">
              <tr>
                <th className="py-4 pl-4 pr-3 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200 sm:pl-6">
                  Bill #
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200">
                  Vendor
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200">
                  Project
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200">
                  Amount
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200">
                  Bill Date
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200">
                  Due Date
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200">
                  Status
                </th>
                {canAdd && (
                  <th className="px-3 py-4 text-right text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200 pr-6">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1E293B]/10 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {bills.map((b) => {
                const badge = STATUS_BADGES[b.payment_status] || STATUS_BADGES.pending;
                return (
                  <tr key={b.id} className="hover:bg-violet-50/40 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-bold text-[#1E293B] dark:text-slate-100 sm:pl-6">
                      <div>{b.bill_number}</div>
                      {b.notes && <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[150px]">{b.notes}</div>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-bold text-[#1E293B] dark:text-slate-200">
                      {b.vendor?.name || "Vendor"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {b.project ? (
                        <Link href={`/dashboard/projects/${b.project_id}`} className="hover:underline text-purple-700 dark:text-purple-400">
                          {b.project.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-black text-rose-700 dark:text-rose-400">
                      {formatINR(b.total_amount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {new Date(b.bill_date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {b.due_date ? new Date(b.due_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black border uppercase tracking-wider shadow-pop-sm ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {b.payment_status}
                      </span>
                    </td>
                    {canAdd && (
                      <td className="whitespace-nowrap px-3 py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <VendorBillModal vendors={vendors} projects={projects} initialData={b} />
                          <DeleteVendorBillButton id={b.id} billNumber={b.bill_number} />
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {bills.length === 0 && (
                <tr>
                  <td colSpan={canAdd ? 8 : 7} className="py-12 text-center text-sm font-medium text-slate-400 dark:text-slate-500">
                    {canAdd
                      ? 'No vendor bills recorded. Click "Log Vendor Bill" to track payables.'
                      : "No vendor bills recorded."}
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
