"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt, Pencil, X, Trash2 } from "lucide-react";
import { createExpenseAction, updateExpenseAction, deleteExpenseAction } from "@/app/actions/crm-actions";
import type { Project, Vendor, Expense } from "@/types/crm";
import { ConfirmModal } from "../components/confirm-modal";

const INPUT = "w-full rounded-xl border-2 border-[#1E293B] bg-[#FFFDF5] p-2 text-xs font-medium text-[#1E293B] focus:outline-none focus:shadow-pop-sm";

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
          className="p-1.5 rounded-lg border-2 border-[#1E293B] bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer"
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
        className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1E293B] btn-primary px-4 py-2 text-xs font-black shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer"
      >
        <Receipt className="h-4 w-4" strokeWidth={2.5} />
        Add Expense
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md transform overflow-y-auto max-h-[90vh] rounded-2xl bg-white border-2 border-[#1E293B] p-6 text-left shadow-pop-lg transition-all">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E293B]/10">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500 border-2 border-[#1E293B]" />
            <h3 className="text-lg font-black text-[#1E293B]">{isEdit ? "Edit Expense" : "Record Operational Expense"}</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg border-2 border-[#1E293B] bg-slate-50 text-[#1E293B] cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl border-2 border-rose-300 bg-rose-50 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Description *</label>
            <input
              type="text"
              name="description"
              required
              defaultValue={initialData?.description}
              placeholder="e.g. Venue sound engineering & mic setups"
              className={INPUT}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Project *</label>
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
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Amount (?) *</label>
              <input
                type="number"
                name="amount"
                required
                defaultValue={initialData?.amount}
                placeholder="25000"
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Vendor (Optional)</label>
              <select
                name="vendor_id"
                defaultValue={initialData?.vendor_id || ""}
                className={INPUT}
              >
                <option value="">None / Direct</option>
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
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Date</label>
              <input
                type="date"
                name="expense_date"
                defaultValue={initialData?.expense_date || new Date().toISOString().split("T")[0]}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Payment Method</label>
              <select
                name="payment_method"
                defaultValue={initialData?.payment_method || "bank_transfer"}
                className={INPUT}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Payment Status</label>
              <select
                name="payment_status"
                defaultValue={initialData?.payment_status || "paid"}
                className={INPUT}
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="partially_paid">Partially Paid</option>
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
              placeholder="Expense notes or receipt refs..."
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
              className="rounded-xl border-2 border-[#1E293B] bg-rose-600 px-5 py-2 text-xs font-black text-white shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer"
            >
              {loading ? "Saving..." : isEdit ? "Update Expense" : "Record Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteExpenseButton({ id, description, projectId }: { id: string; description: string; projectId?: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteExpenseAction(id, projectId);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to delete expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-lg border-2 border-[#1E293B] bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
        title="Delete Expense"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        title="Delete Expense"
        message={`Are you sure you want to delete expense "${description}"? This cannot be undone.`}
        confirmLabel="Delete Expense"
        isDanger
        loading={loading}
        errorMessage={error}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!loading) {
            setIsOpen(false);
            setError(null);
          }
        }}
      />
    </>
  );
}
