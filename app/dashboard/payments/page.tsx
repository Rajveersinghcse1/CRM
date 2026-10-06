import { getClientPayments, getClients, getProjects, getInvoices } from "@/lib/crm-db";
import { getCurrentUserRole, canMutateInvoices } from "@/utils/auth";
import { formatINR } from "@/utils/finance-calc";
import { PaymentModal, DeletePaymentButton } from "./payment-modal";
import { CreditCard, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function PaymentsPage() {
  const [payments, clients, projects, invoices, role] = await Promise.all([
    getClientPayments(),
    getClients(),
    getProjects(),
    getInvoices(),
    getCurrentUserRole(),
  ]);

  const canAdd = canMutateInvoices(role);

  const totalCollected = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b-2 border-[#1E293B]/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-emerald-100 border-2 border-[#1E293B]">
              <CreditCard className="h-4 w-4 text-emerald-700" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-[#1E293B]">
              Client Payments & Cash Flow
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">
            Log installment payments, verify transaction references, and track collected revenue.
          </p>
        </div>
        {canAdd && <PaymentModal clients={clients} projects={projects} invoices={invoices} />}
      </div>

      {/* Summary Card */}
      <div className="flex items-center gap-4 rounded-2xl border-2 border-[#1E293B] bg-white p-5 shadow-pop">
        <div className="h-12 w-12 rounded-2xl bg-emerald-100 border-2 border-[#1E293B] flex items-center justify-center text-emerald-800 shrink-0 shadow-pop-sm">
          <CheckCircle className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">
            Total Cash Collected
          </p>
          <p className="text-3xl font-black text-emerald-800 mt-0.5">
            {formatINR(totalCollected)}
          </p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-hidden rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-[#1E293B]/10">
            <thead className="bg-[#FFFDF5] border-b-2 border-[#1E293B]">
              <tr>
                <th className="py-4 pl-4 pr-3 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] sm:pl-6">
                  Payment #
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Client
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Project
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Amount
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Method & Ref
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
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-violet-50/40 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-bold text-slate-700 sm:pl-6">
                    {p.payment_number || "PAY"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs font-bold text-[#1E293B]">
                    <div>{p.client?.name || "Client"}</div>
                    <span className="text-[10px] text-slate-400 font-normal">{p.client?.company_name}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs font-semibold text-slate-600">
                    {p.project ? (
                      <Link href={`/dashboard/projects/${p.project_id}`} className="hover:underline text-purple-700">
                        {p.project.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs font-black text-emerald-800">
                    +{formatINR(p.amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs font-medium text-slate-600">
                    <span className="font-bold text-[#1E293B]">{p.payment_method.toUpperCase()}</span>
                    {p.reference_number && <div className="text-[10px] text-slate-400">{p.reference_number}</div>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs font-medium text-slate-500">
                    {new Date(p.payment_date).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${
                      p.status === "completed"
                        ? "bg-emerald-100 border-[#34D399] text-emerald-950"
                        : p.status === "pending"
                        ? "bg-amber-100 border-[#FBBF24] text-amber-950"
                        : "bg-slate-100 border-slate-300 text-slate-700"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  {canAdd && (
                    <td className="whitespace-nowrap px-3 py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <PaymentModal
                          clients={clients}
                          projects={projects}
                          invoices={invoices}
                          initialData={p}
                        />
                        <DeletePaymentButton id={p.id} paymentNumber={p.payment_number || undefined} projectId={p.project_id || undefined} />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={canAdd ? 8 : 7} className="py-12 text-center text-sm font-medium text-slate-400">
                    {canAdd
                      ? 'No client payments recorded. Click "Log Client Payment" to add one.'
                      : "No client payments recorded."}
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
