"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, Pencil, X, Trash2 } from "lucide-react";
import { createVendorAction, updateVendorAction, deleteVendorAction } from "@/app/actions/crm-actions";
import type { Vendor } from "@/types/crm";
import { ConfirmModal } from "../components/confirm-modal";

const INPUT = "w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2 text-xs font-medium text-[#1E293B] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:shadow-pop-sm";

export function VendorModal({ initialData }: { initialData?: Vendor }) {
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
      const name = (form.get("name") as string)?.trim();
      if (!name) {
        throw new Error("Vendor name is required.");
      }

      const data = {
        name,
        company_name: (form.get("company_name") as string) || "",
        phone: (form.get("phone") as string) || "",
        email: (form.get("email") as string) || "",
        category: (form.get("category") as string) || "General Supplier",
        address: (form.get("address") as string) || "",
        gst_number: (form.get("gst_number") as string) || "",
        notes: (form.get("notes") as string) || "",
      };

      if (isEdit) {
        await updateVendorAction(initialData!.id, data);
      } else {
        await createVendorAction(data);
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save vendor.");
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
          title="Edit Vendor"
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
        <Truck className="h-4 w-4" strokeWidth={2.5} />
        Add Vendor
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md transform overflow-y-auto max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#1E293B] dark:border-slate-800 p-6 text-left shadow-pop-lg transition-all">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E293B]/10 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#8B5CF6] border-2 border-[#1E293B] dark:border-slate-700" />
            <h3 className="text-lg font-black text-[#1E293B] dark:text-slate-100">{isEdit ? "Edit Vendor" : "Register Vendor / Contractor"}</h3>
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
            <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Vendor Name *</label>
            <input
              type="text"
              name="name"
              required
              defaultValue={initialData?.name}
              placeholder="e.g. Grand Stage Lighting"
              className={INPUT}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Trade Category</label>
              <select
                name="category"
                defaultValue={initialData?.category || "Decoration"}
                className={INPUT}
              >
                <option value="Decoration">Decoration & Stage</option>
                <option value="Modeling">Modeling & Talent</option>
                <option value="AudioVisual">Audio / Visual</option>
                <option value="Printing">Printing & Signage</option>
                <option value="Catering">Catering & Hospitality</option>
                <option value="Freelancer">Freelance Creator</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                defaultValue={initialData?.phone || ""}
                placeholder="+91 99090 12345"
                className={INPUT}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={initialData?.email || ""}
                placeholder="contact@vendor.com"
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">GST / Tax #</label>
              <input
                type="text"
                name="gst_number"
                defaultValue={initialData?.gst_number || ""}
                placeholder="24AAACA1111A1Z0"
                className={INPUT}
              />
            </div>
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
              className="rounded-xl border-2 border-[#1E293B] dark:border-slate-900 btn-primary px-5 py-2 text-xs font-black shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer"
            >
              {loading ? "Saving..." : isEdit ? "Update Vendor" : "Save Vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteVendorButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteVendorAction(id);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to delete vendor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-lg border-2 border-[#1E293B] dark:border-slate-700 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all cursor-pointer"
        title="Delete Vendor"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        title="Delete Vendor"
        message={`Are you sure you want to delete vendor "${name}"? This cannot be undone.`}
        confirmLabel="Delete Vendor"
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
