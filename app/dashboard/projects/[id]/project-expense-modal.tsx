"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt, Pencil, Trash2, X, AlertCircle } from "lucide-react";
import {
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
} from "@/app/actions/crm-actions";
import { ConfirmModal } from "@/app/dashboard/components/confirm-modal";
import type { ProjectCategory, Vendor, Expense } from "@/types/crm";

export function ProjectExpenseModal({
  projectId,
  clientId,
  categories,
  vendors,
  initialData,
}: {
  projectId: string;
  clientId: string;
  categories: ProjectCategory[];
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
    const form = new FormData(e.currentTarget);

    const description = (form.get("description") as string)?.trim();
    const amount = Number(form.get("amount")) || 0;

    if (!description) {
      setError("Please provide an expense description.");
      setLoading(false);
      return;
    }

    const data = {
      project_id: projectId,
      client_id: clientId,
      category_id: (form.get("category_id") as string) || null,
      vendor_id: (form.get("vendor_id") as string) || null,
      description,
      amount,
      expense_date: (form.get("expense_date") as string) || new Date().toISOString().split("T")[0],
      payment_method: (form.get("payment_method") as any) || "bank_transfer",
      payment_status: (form.get("payment_status") as any) || (isEdit ? initialData?.payment_status : "paid"),
      bill_number: (form.get("bill_number") as string)?.trim() || null,
    };

    try {
      if (isEdit) {
        await updateExpenseAction(initialData!.id, data);
      } else {
        await createExpenseAction(data);
      }
      setLoading(false);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error("Error saving project expense:", err);
      setError(err?.message || "Failed to save expense. Please try again.");
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
          className="p-1.5 rounded-lg border-2 border-[#1E293B] dark:border-slate-700 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all cursor-pointer"
          title="Edit Expense"
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
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 btn-primary px-3.5 py-1.5 text-xs font-black shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer"
      >
        <Receipt className="h-3.5 w-3.5" strokeWidth={2.5} />
        Log Expense
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#1E293B] dark:border-slate-800 p-6 text-left shadow-pop-lg">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E293B]/10 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500 border-2 border-[#1E293B] dark:border-slate-700" />
            <h3 className="text-lg font-black text-[#1E293B] dark:text-slate-100">
              {isEdit ? "Edit Project Expense" : "Log Project Expense"}
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg border-2 border-[#1E293B] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#1E293B] dark:text-slate-200 cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 p-2.5 bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-400 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-400 text-xs font-bold">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">
              Description *
            </label>
            <input
              type="text"
              name="description"
              required
              defaultValue={initialData?.description}
              placeholder="e.g. Stage Lightings Trussing Vendor Bill"
              className="w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2 text-xs font-medium text-[#1E293B] dark:text-slate-100 dark:placeholder-slate-500 focus:outline-none focus:shadow-pop-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                name="category_id"
                defaultValue={initialData?.category_id || ""}
                className="w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2 text-xs font-medium text-[#1E293B] dark:text-slate-100 focus:outline-none focus:shadow-pop-sm"
              >
                <option value="">General / Unassigned</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                name="amount"
                required
                min="0"
                defaultValue={initialData?.amount}
                placeholder="60000"
                className="w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2 text-xs font-medium text-[#1E293B] dark:text-slate-100 dark:placeholder-slate-500 focus:outline-none focus:shadow-pop-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">
                Vendor (Optional)
              </label>
              <select
                name="vendor_id"
                defaultValue={initialData?.vendor_id || ""}
                className="w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2 text-xs font-medium text-[#1E293B] dark:text-slate-100 focus:outline-none focus:shadow-pop-sm"
              >
                <option value="">No vendor / Direct</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                name="payment_method"
                defaultValue={initialData?.payment_method || "bank_transfer"}
                className="w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2 text-xs font-medium text-[#1E293B] dark:text-slate-100 focus:outline-none focus:shadow-pop-sm"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                name="expense_date"
                defaultValue={initialData?.expense_date ? initialData.expense_date.split("T")[0] : new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2 text-xs font-medium text-[#1E293B] dark:text-slate-100 focus:outline-none focus:shadow-pop-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">
                Bill / Ref Number
              </label>
              <input
                type="text"
                name="bill_number"
                defaultValue={initialData?.bill_number || ""}
                placeholder="e.g. GS-BILL-104"
                className="w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2 text-xs font-medium text-[#1E293B] dark:text-slate-100 dark:placeholder-slate-500 focus:outline-none focus:shadow-pop-sm"
              />
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">
                Payment Status
              </label>
              <select
                name="payment_status"
                defaultValue={initialData?.payment_status || "paid"}
                className="w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2 text-xs font-medium text-[#1E293B] dark:text-slate-100 focus:outline-none focus:shadow-pop-sm"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="partially_paid">Partially Paid</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-[#1E293B] dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-rose-600 px-5 py-2 text-xs font-black text-white shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : isEdit ? "Update Expense" : "Record Cost"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteProjectExpenseButton({
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
        className="p-1.5 rounded-lg border-2 border-[#1E293B] dark:border-slate-700 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all cursor-pointer disabled:opacity-50"
        title="Delete Expense"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Delete Expense"
        message={`Are you sure you want to delete the expense "${description}"? Actual project cost records will be adjusted accordingly.`}
        confirmText="Yes, Delete Expense"
        loading={loading}
        error={error}
      />
    </>
  );
}
