"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Pencil, Trash2, X, AlertCircle } from "lucide-react";
import {
  createInvoiceAction,
  updateInvoiceAction,
  deleteInvoiceAction,
} from "@/app/actions/crm-actions";
import { ConfirmModal } from "@/app/dashboard/components/confirm-modal";
import type { Client, Project, Invoice } from "@/types/crm";

const INPUT = "w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2 text-xs font-medium text-[#1E293B] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:shadow-pop-sm";

export function InvoiceModal({
  clients,
  projects,
  initialData,
}: {
  clients: Client[];
  projects: Project[];
  initialData?: Invoice;
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
    const desc = (form.get("item_desc") as string)?.trim() || "Service Delivery";
    const dueDate = (form.get("due_date") as string) || null;

    if (!clientId) {
      setError("Please select a client.");
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        await updateInvoiceAction(initialData!.id, {
          client_id: clientId,
          project_id: (form.get("project_id") as string) || null,
          due_date: dueDate,
          notes: form.get("notes") as string,
          total: amount,
          subtotal: amount,
          status: (form.get("status") as any) || initialData?.status || "issued",
        });
      } else {
        await createInvoiceAction(
          {
            client_id: clientId,
            project_id: (form.get("project_id") as string) || null,
            due_date: dueDate,
            notes: form.get("notes") as string,
            total: amount,
            subtotal: amount,
            status: "issued",
          },
          [{ description: desc, quantity: 1, unit_price: amount }]
        );
      }

      setLoading(false);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error("Error saving invoice:", err);
      setError(err?.message || "Failed to save invoice. Please try again.");
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
          className="p-1.5 rounded-lg border-2 border-[#1E293B] dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all cursor-pointer"
          title="Edit Invoice"
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      );
    }

    return (
      <button
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1E293B] dark:border-blue-500/40 btn-primary px-4 py-2 text-xs font-black shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer"
      >
        <FileText className="h-4 w-4" strokeWidth={2.5} />
        Create Invoice
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/40 dark:bg-slate-950/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md transform overflow-y-auto max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#1E293B] dark:border-slate-700 p-6 text-left shadow-pop-lg transition-all">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E293B]/10 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500 border-2 border-[#1E293B] dark:border-blue-400" />
            <h3 className="text-lg font-black text-[#1E293B] dark:text-slate-100">
              {isEdit ? "Edit Client Invoice" : "Create Client Invoice"}
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg border-2 border-[#1E293B] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#1E293B] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 p-2.5 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-400 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-bold">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Client *</label>
            <select
              name="client_id"
              required
              defaultValue={initialData?.client_id || (clients[0]?.id || "")}
              className={INPUT}
            >
              {clients.length === 0 && <option value="" className="dark:bg-slate-900 dark:text-slate-100">No clients available</option>}
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="dark:bg-slate-900 dark:text-slate-100">
                  {c.name} ({c.company_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Project</label>
            <select
              name="project_id"
              defaultValue={initialData?.project_id || ""}
              className={INPUT}
            >
              <option value="" className="dark:bg-slate-900 dark:text-slate-100">None / General Retainer</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-slate-900 dark:text-slate-100">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {!isEdit && (
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">
                Line Item Description *
              </label>
              <input
                type="text"
                name="item_desc"
                required
                placeholder="e.g. Garba Event Production & Digital Marketing Retainer"
                className={INPUT}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">
                Total Amount (₹) *
              </label>
              <input
                type="number"
                name="amount"
                required
                min="0"
                defaultValue={initialData?.total}
                placeholder="500000"
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                name="due_date"
                defaultValue={initialData?.due_date ? initialData.due_date.split("T")[0] : new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]}
                className={INPUT}
              />
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Status</label>
              <select
                name="status"
                defaultValue={initialData?.status || "issued"}
                className={INPUT}
              >
                <option value="draft" className="dark:bg-slate-900 dark:text-slate-100">Draft</option>
                <option value="issued" className="dark:bg-slate-900 dark:text-slate-100">Issued</option>
                <option value="partially_paid" className="dark:bg-slate-900 dark:text-slate-100">Partially Paid</option>
                <option value="paid" className="dark:bg-slate-900 dark:text-slate-100">Paid</option>
                <option value="overdue" className="dark:bg-slate-900 dark:text-slate-100">Overdue</option>
                <option value="cancelled" className="dark:bg-slate-900 dark:text-slate-100">Cancelled</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Notes / Terms</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={initialData?.notes || ""}
              placeholder="Payment due within 14 days of issue..."
              className={INPUT}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-[#1E293B] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl border-2 border-[#1E293B] dark:border-blue-500/40 btn-primary px-5 py-2 text-xs font-black shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : isEdit ? "Update Invoice" : "Issue Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteInvoiceButton({
  id,
  invoiceNumber,
}: {
  id: string;
  invoiceNumber: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteInvoiceAction(id);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error("Error deleting invoice:", err);
      setError(err?.message || "Failed to delete invoice.");
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
        className="p-1.5 rounded-lg border-2 border-[#1E293B] dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all cursor-pointer disabled:opacity-50"
        title="Delete Invoice"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Delete Invoice"
        message={`Are you sure you want to permanently delete invoice "${invoiceNumber}"? This cannot be undone.`}
        confirmText="Yes, Delete Invoice"
        loading={loading}
        error={error}
      />
    </>
  );
}
