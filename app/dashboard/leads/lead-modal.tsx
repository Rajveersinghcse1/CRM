"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Pencil, X, Trash2 } from "lucide-react";
import { createLeadAction, updateLeadAction, deleteLeadAction } from "@/app/actions/crm-actions";
import type { Lead } from "@/types/crm";
import { ConfirmModal } from "../components/confirm-modal";

const INPUT = "w-full rounded-xl border-2 border-[#1E293B] bg-[#FFFDF5] p-2 text-xs font-medium text-[#1E293B] focus:outline-none focus:shadow-pop-sm";
const SOURCES = ["Website", "Instagram", "LinkedIn", "Facebook", "Referral", "Cold Outreach"];
const STATUSES = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"];

export function LeadModal({ initialData }: { initialData?: Lead }) {
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
      const fullName = (form.get("full_name") as string)?.trim();
      if (!fullName) {
        throw new Error("Full name is required.");
      }

      const data = {
        full_name: fullName,
        company_name: (form.get("company_name") as string) || "",
        email: (form.get("email") as string) || "",
        phone: (form.get("phone") as string) || "",
        designation: (form.get("designation") as string) || "",
        source: (form.get("source") as string) || "Website",
        status: (form.get("status") as string) || "new",
        lead_value: Number(form.get("lead_value")) || 0,
        expected_close_date: (form.get("expected_close_date") as string) || null,
        notes: (form.get("notes") as string) || "",
      };

      if (isEdit) {
        await updateLeadAction(initialData!.id, data);
      } else {
        await createLeadAction({ ...data, status: "new" });
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save lead.");
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
          title="Edit lead"
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
        className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1E293B] btn-gold px-4 py-2 text-xs font-black shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
      >
        <UserPlus className="h-4 w-4" strokeWidth={2.5} />
        Add Lead
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white border-2 border-[#1E293B] p-6 shadow-pop-lg overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E293B]/10">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#8B5CF6] border-2 border-[#1E293B]" />
            <h3 className="text-lg font-black text-[#1E293B]">{isEdit ? "Edit Lead" : "Create New Lead"}</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg border-2 border-[#1E293B] bg-slate-50 text-[#1E293B] cursor-pointer">
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl border-2 border-rose-300 bg-rose-50 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Full Name *</label>
              <input type="text" name="full_name" required defaultValue={initialData?.full_name} placeholder="e.g. Rahul Sharma" className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Company Name</label>
              <input type="text" name="company_name" defaultValue={initialData?.company_name || ""} placeholder="e.g. Apex Corp" className={INPUT} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Email</label>
              <input type="email" name="email" defaultValue={initialData?.email || ""} placeholder="rahul@example.com" className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Phone</label>
              <input type="tel" name="phone" defaultValue={initialData?.phone || ""} placeholder="+91 98765 43210" className={INPUT} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Source</label>
              <select name="source" defaultValue={initialData?.source || "Website"} className={INPUT}>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Lead Value (?)</label>
              <input type="number" name="lead_value" defaultValue={initialData?.lead_value || ""} placeholder="250000" className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Target Close</label>
              <input type="date" name="expected_close_date" defaultValue={initialData?.expected_close_date || ""} className={INPUT} />
            </div>
          </div>
          {isEdit && (
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Status</label>
              <select name="status" defaultValue={initialData?.status || "new"} className={INPUT}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Notes</label>
            <textarea name="notes" rows={2} defaultValue={initialData?.notes || ""} placeholder="Initial requirements, budget discussions..." className={INPUT} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-xl border-2 border-[#1E293B] bg-slate-100 px-4 py-2 text-xs font-bold text-[#1E293B] hover:bg-slate-200 transition-all cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading} className="rounded-xl border-2 border-[#1E293B] btn-gold px-5 py-2 text-xs font-black shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer">
              {loading ? "Saving..." : isEdit ? "Update Lead" : "Save Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteLeadButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteLeadAction(id);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to delete lead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-lg border-2 border-[#1E293B] bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
        title="Delete lead"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        title="Delete Lead"
        message={`Are you sure you want to delete lead "${name}"? This cannot be undone.`}
        confirmLabel="Delete Lead"
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
