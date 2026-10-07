"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, Pencil, X, Trash2 } from "lucide-react";
import { createVendorBillAction, updateVendorBillAction, deleteVendorBillAction } from "@/app/actions/crm-actions";
import type { Vendor, Project, VendorBill } from "@/types/crm";
import { ConfirmModal } from "../components/confirm-modal";

const INPUT = "w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2 text-xs font-medium text-[#1E293B] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:shadow-pop-sm";

export function VendorBillModal({
  vendors,
  projects,
  initialData,
}: {
  vendors: Vendor[];
  projects: Project[];
  initialData?: VendorBill;
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
      const vendorId = form.get("vendor_id") as string;
      const billNumber = (form.get("bill_number") as string)?.trim();

      if (!vendorId) {
        throw new Error("Please select a vendor.");
      }
      if (!billNumber) {
        throw new Error("Bill number is required.");
      }

      const amount = Number(form.get("amount")) || 0;
      if (amount <= 0) {
        throw new Error("Please enter a valid bill amount greater than 0.");
      }

      const data = {
        vendor_id: vendorId,
        project_id: (form.get("project_id") as string) || null,
        bill_number: billNumber,
        bill_date: (form.get("bill_date") as string) || new Date().toISOString().split("T")[0],
        due_date: (form.get("due_date") as string) || null,
        amount,
        payment_status: (form.get("payment_status") as any) || (isEdit ? initialData?.payment_status : "pending"),
        notes: (form.get("notes") as string) || "",
      };

      if (isEdit) {
        await updateVendorBillAction(initialData!.id, data);
      } else {
        await createVendorBillAction(data);
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save vendor bill.");
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
          className="p-1.5 rounded-lg border-2 border-[#1E293B] dark:border-slate-700 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all cursor-pointer"
          title="Edit Bill"
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
        <FileSpreadsheet className="h-4 w-4" strokeWidth={2.5} />
        Log Vendor Bill
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md transform overflow-y-auto max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#1E293B] dark:border-slate-800 p-6 text-left shadow-pop-lg transition-all">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E293B]/10 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-orange-500 border-2 border-[#1E293B] dark:border-slate-700" />
            <h3 className="text-lg font-black text-[#1E293B] dark:text-slate-100">{isEdit ? "Edit Vendor Bill" : "Log Vendor Payable Bill"}</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg border-2 border-[#1E293B] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#1E293B] dark:text-slate-300 cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl border-2 border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 text-xs font-bold text-rose-700 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Vendor *</label>
            <select
              name="vendor_id"
              required
              defaultValue={initialData?.vendor_id || (vendors[0]?.id || "")}
              className={INPUT}
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.category})
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
              <option value="">None / Overhead</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Bill # *</label>
              <input
                type="text"
                name="bill_number"
                required
                defaultValue={initialData?.bill_number}
                placeholder="e.g. GS-BILL-104"
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Amount (₹) *</label>
              <input
                type="number"
                name="amount"
                required
                defaultValue={initialData?.amount}
                placeholder="60000"
                className={INPUT}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Bill Date</label>
              <input
                type="date"
                name="bill_date"
                defaultValue={initialData?.bill_date || new Date().toISOString().split("T")[0]}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                name="due_date"
                defaultValue={initialData?.due_date || ""}
                className={INPUT}
              />
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Payment Status</label>
              <select
                name="payment_status"
                defaultValue={initialData?.payment_status || "pending"}
                className={INPUT}
              >
                <option value="pending">Pending</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Notes</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={initialData?.notes || ""}
              placeholder="Terms, items covered..."
              className={INPUT}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
              className="rounded-xl border-2 border-[#1E293B] dark:border-slate-900 bg-orange-600 px-5 py-2 text-xs font-black text-white shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer"
            >
              {loading ? "Saving..." : isEdit ? "Update Bill" : "Record Bill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteVendorBillButton({ id, billNumber }: { id: string; billNumber: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteVendorBillAction(id);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to delete vendor bill.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-lg border-2 border-[#1E293B] dark:border-slate-700 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all cursor-pointer"
        title="Delete Vendor Bill"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        title="Delete Vendor Bill"
        message={`Are you sure you want to delete vendor bill "${billNumber}"? This cannot be undone.`}
        confirmLabel="Delete Bill"
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
