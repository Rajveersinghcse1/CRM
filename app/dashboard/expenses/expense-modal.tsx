"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt, Pencil, X, Trash2, Info } from "lucide-react";
import { createExpenseAction, updateExpenseAction, deleteExpenseAction } from "@/app/actions/crm-actions";
import type { Project, Vendor, Expense } from "@/types/crm";
import { STANDARD_EXPENSE_CATEGORIES } from "@/utils/finance-calc";
import { ConfirmModal } from "../components/confirm-modal";

const INPUT = "w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs";

export function ExpenseModal({
  projects,
  vendors,
  initialData,
}: {
  projects: Project[];
  vendors: Vendor[];
  initialData?: Expense;
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
    try {
      const form = new FormData(e.currentTarget);
      const projectId = form.get("project_id") as string;
      const description = (form.get("description") as string)?.trim();

      if (!projectId) {
        throw new Error("Please select a project.");
      }
      if (!description) {
        throw new Error("Expense description is required.");
      }

      const amount = Number(form.get("amount")) || 0;
      if (amount <= 0) {
        throw new Error("Please enter a valid expense amount greater than 0.");
      }

      const data = {
        project_id: projectId,
        vendor_id: (form.get("vendor_id") as string) || null,
        description,
        amount,
        expense_date: (form.get("expense_date") as string) || new Date().toISOString().split("T")[0],
        payment_method: (form.get("payment_method") as any) || "bank_transfer",
        payment_status: (form.get("payment_status") as any) || (isEdit ? initialData?.payment_status : "paid"),
        bill_number: (form.get("bill_number") as string) || "",
        notes: (form.get("notes") as string) || "",
      };

      if (isEdit) {
        await updateExpenseAction(initialData!.id, data);
      } else {
        await createExpenseAction(data);
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save expense.");
    } finally {
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
          title="Edit Expense"
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
        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
      >
        <Receipt className="h-3.5 w-3.5" />
        <span>+ Log Expense</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md transform overflow-y-auto max-h-[90vh] rounded-2xl bg-white border border-slate-200 p-6 text-left shadow-xl transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <h3 className="text-base font-bold text-slate-900">
              {isEdit ? "Edit Project Expense" : "Record Project Expense"}
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
        <div className="mt-3 p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80 text-[11px] text-rose-900 flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
          <span>
            <strong>Dual-Balance Impact:</strong> Expenses draw from collected funds to reduce <em>Available Balance</em>. They do <strong>not</strong> change what the client owes.
          </span>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl border border-rose-300 bg-rose-50 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
            <input
              type="text"
              name="description"
              required
              defaultValue={initialData?.description}
              placeholder="e.g. Meta Ads campaign advance"
              className={INPUT}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Project *</label>
            <select
              name="project_id"
              required
              defaultValue={initialData?.project_id || (projects[0]?.id || "")}
              className={INPUT}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                name="amount"
                required
                defaultValue={initialData?.amount}
                placeholder="8000"
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Paid To / Vendor</label>
              <select
                name="vendor_id"
                defaultValue={initialData?.vendor_id || ""}
                className={INPUT}
              >
                <option value="">Direct / Meta / Other</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expense Date</label>
              <input
                type="date"
                name="expense_date"
                defaultValue={initialData?.expense_date || new Date().toISOString().split("T")[0]}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                name="payment_method"
                defaultValue={initialData?.payment_method || "bank_transfer"}
                className={INPUT}
              >
                <option value="bank_transfer">Bank Transfer / Company Account</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bill / Reference Number</label>
            <input
              type="text"
              name="bill_number"
              defaultValue={initialData?.bill_number || ""}
              placeholder="e.g. INV-META-901"
              className={INPUT}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Remarks</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={initialData?.notes || ""}
              placeholder="e.g. Campaign advance for festive launch"
              className={INPUT}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : isEdit ? "Update Expense" : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteExpenseButton({
  id,
  description,
  projectId,
}: {
  id: string;
  description: string;
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
      await deleteExpenseAction(id, projectId);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error("Error deleting expense:", err);
      setError(err?.message || "Failed to delete expense.");
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
        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer disabled:opacity-50"
        title="Delete Expense"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Delete Expense Record"
        message={`Are you sure you want to delete "${description}"? This cost will be removed from project expenses.`}
        confirmText="Yes, Delete Expense"
        loading={loading}
        error={error}
      />
    </>
  );
}
