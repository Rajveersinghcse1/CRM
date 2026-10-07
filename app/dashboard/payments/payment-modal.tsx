"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Pencil, Trash2, X, AlertCircle } from "lucide-react";
import {
  createClientPaymentAction,
  updateClientPaymentAction,
  deleteClientPaymentAction,
} from "@/app/actions/crm-actions";
import { ConfirmModal } from "@/app/dashboard/components/confirm-modal";
import type { Client, Project, Invoice, ClientPayment } from "@/types/crm";

const INPUT = "w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs";

export function PaymentModal({
  clients,
  projects,
  invoices,
  initialData,
}: {
  clients: Client[];
  projects: Project[];
  invoices: Invoice[];
  initialData?: ClientPayment;
}) {
  const isEdit = !!initialData;
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    const clientId = form.get("client_id") as string;
    const amount = Number(form.get("amount")) || 0;

    if (!clientId) {
      setError("Please select a client.");
      setLoading(false);
      return;
    }

    if (amount <= 0) {
      setError("Payment amount must be greater than zero.");
      setLoading(false);
      return;
    }

    const data = {
      client_id: clientId,
      project_id: (form.get("project_id") as string) || null,
      invoice_id: (form.get("invoice_id") as string) || null,
      amount,
      payment_date: (form.get("payment_date") as string) || new Date().toISOString().split("T")[0],
      payment_method: (form.get("payment_method") as any) || "bank_transfer",
      reference_number: (form.get("reference_number") as string)?.trim() || null,
      notes: (form.get("notes") as string)?.trim() || null,
      status: (form.get("status") as any) || (isEdit ? initialData?.status : "completed"),
    };

    try {
      if (isEdit) {
        await updateClientPaymentAction(initialData!.id, data, data.project_id || undefined);
      } else {
        await createClientPaymentAction(data);
      }

      setLoading(false);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error("Error saving payment:", err);
      setError(err?.message || "Failed to record payment. Please try again.");
      setLoading(false);
    }
  };

  if (!isOpen) {
    if (isEdit) {
      return (
        <button
          onClick={() => {
            setError(null);
            setIsOpen(true);
          }}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-all cursor-pointer"
          title="Edit Payment"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      );
    }

    return (
      <button
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
      >
        <CreditCard className="h-3.5 w-3.5" />
        <span>+ Record Payment</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md transform overflow-y-auto max-h-[90vh] rounded-2xl bg-white border border-slate-200 p-6 text-left shadow-xl transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-base font-bold text-slate-900">
              {isEdit ? "Edit Client Payment" : "Record Client Payment"}
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Guidance Note */}
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-900">
          <strong>Dual-Balance Impact:</strong> This payment directly reduces <em>Client Pending</em> and adds to <em>Available Unspent Balance</em>.
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 p-2.5 bg-rose-50 border-2 border-rose-400 rounded-xl text-rose-700 text-xs font-bold">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Client *</label>
            <select
              name="client_id"
              required
              defaultValue={initialData?.client_id || (clients[0]?.id || "")}
              className={INPUT}
            >
              {clients.length === 0 && <option value="">No clients available</option>}
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company_name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Project</label>
              <select
                name="project_id"
                defaultValue={initialData?.project_id || ""}
                className={INPUT}
              >
                <option value="">None / General</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Invoice</label>
              <select
                name="invoice_id"
                defaultValue={initialData?.invoice_id || ""}
                className={INPUT}
              >
                <option value="">None / Advance</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} (Total: ₹{inv.total.toLocaleString("en-IN")})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">
                Amount Received (₹) *
              </label>
              <input
                type="number"
                name="amount"
                required
                min="1"
                defaultValue={initialData?.amount}
                placeholder="50000"
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Payment Date *</label>
              <input
                type="date"
                name="payment_date"
                required
                defaultValue={initialData?.payment_date ? initialData.payment_date.split("T")[0] : new Date().toISOString().split("T")[0]}
                className={INPUT}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Method *</label>
              <select
                name="payment_method"
                defaultValue={initialData?.payment_method || "bank_transfer"}
                className={INPUT}
              >
                <option value="bank_transfer">Bank Transfer / NEFT</option>
                <option value="upi">UPI / QR</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Reference / UTR #</label>
              <input
                type="text"
                name="reference_number"
                defaultValue={initialData?.reference_number || ""}
                placeholder="e.g. UTR-982348123"
                className={INPUT}
              />
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Status</label>
              <select
                name="status"
                defaultValue={initialData?.status || "completed"}
                className={INPUT}
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Notes</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={initialData?.notes || ""}
              placeholder="Part payment, client confirmation note..."
              className={INPUT}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border-2 border-[#1E293B] bg-slate-100 px-4 py-2 text-xs font-bold text-[#1E293B] hover:bg-slate-200 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl border-2 border-[#1E293B] btn-gold px-5 py-2 text-xs font-black shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : isEdit ? "Update Payment" : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeletePaymentButton({
  id,
  paymentNumber,
  projectId,
}: {
  id: string;
  paymentNumber?: string;
  projectId?: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteClientPaymentAction(id, projectId);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error("Error deleting payment:", err);
      setError(err?.message || "Failed to delete payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        disabled={loading}
        className="p-1.5 rounded-lg border-2 border-[#1E293B] bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all cursor-pointer disabled:opacity-50"
        title="Delete Payment"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Delete Payment Record"
        message={`Are you sure you want to delete payment "${paymentNumber || id}"? Collected cash calculations will be updated accordingly.`}
        confirmText="Yes, Delete Payment"
        loading={loading}
        error={error}
      />
    </>
  );
}
