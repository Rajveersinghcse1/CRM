"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitPullRequest, Pencil, X, Trash2 } from "lucide-react";
import { createDealAction, updateDealAction, deleteDealAction } from "@/app/actions/crm-actions";
import type { Client, Service, Deal } from "@/types/crm";
import { ConfirmModal } from "../components/confirm-modal";

const INPUT = "w-full rounded-xl border-2 border-[#1E293B] bg-[#FFFDF5] p-2 text-xs font-medium text-[#1E293B] focus:outline-none focus:shadow-pop-sm";

export function DealModal({
  clients,
  services,
  initialData,
}: {
  clients: Client[];
  services: Service[];
  initialData?: Deal;
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
      const dealName = (form.get("deal_name") as string)?.trim();
      const clientId = form.get("client_id") as string;

      if (!dealName) {
        throw new Error("Deal name is required.");
      }
      if (!clientId) {
        throw new Error("Please select a client for this deal.");
      }

      const data = {
        deal_name: dealName,
        client_id: clientId,
        service_id: (form.get("service_id") as string) || null,
        estimated_value: Number(form.get("estimated_value")) || 0,
        stage: (form.get("stage") as any) || (isEdit ? initialData?.stage : "new"),
        probability: Number(form.get("probability")) || 30,
        expected_close_date: (form.get("expected_close_date") as string) || null,
        source: (form.get("source") as string) || "",
        notes: (form.get("notes") as string) || "",
      };

      if (isEdit) {
        await updateDealAction(initialData!.id, data);
      } else {
        await createDealAction(data);
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save deal.");
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
          title="Edit Deal"
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
        <GitPullRequest className="h-4 w-4" strokeWidth={2.5} />
        Create Deal
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg transform overflow-y-auto max-h-[90vh] rounded-2xl bg-white border-2 border-[#1E293B] p-6 text-left shadow-pop-lg transition-all">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E293B]/10">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#D97706] border-2 border-[#1E293B]" />
            <h3 className="text-lg font-black text-[#1E293B]">{isEdit ? "Edit Deal Opportunity" : "Create New Deal Opportunity"}</h3>
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
            <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Deal Name *</label>
            <input
              type="text"
              name="deal_name"
              required
              defaultValue={initialData?.deal_name}
              placeholder="e.g. Annual Digital Retainer"
              className={INPUT}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Client *</label>
              <select
                name="client_id"
                required
                defaultValue={initialData?.client_id || (clients[0]?.id || "")}
                className={INPUT}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company_name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Primary Service</label>
              <select
                name="service_id"
                defaultValue={initialData?.service_id || ""}
                className={INPUT}
              >
                <option value="">Select Service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Est. Value (?) *</label>
              <input
                type="number"
                name="estimated_value"
                required
                defaultValue={initialData?.estimated_value}
                placeholder="400000"
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Probability (%)</label>
              <input
                type="number"
                name="probability"
                min="0"
                max="100"
                defaultValue={initialData?.probability ?? 30}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Target Close</label>
              <input
                type="date"
                name="expected_close_date"
                defaultValue={initialData?.expected_close_date || ""}
                className={INPUT}
              />
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Stage</label>
              <select
                name="stage"
                defaultValue={initialData?.stage || "new"}
                className={INPUT}
              >
                <option value="new">New</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Notes</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={initialData?.notes || ""}
              placeholder="Terms, discussions, next steps..."
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
              className="rounded-xl border-2 border-[#1E293B] btn-primary px-5 py-2 text-xs font-black shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer"
            >
              {loading ? "Saving..." : isEdit ? "Update Deal" : "Save Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteDealButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteDealAction(id);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to delete deal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-lg border-2 border-[#1E293B] bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
        title="Delete Deal"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        title="Delete Deal"
        message={`Are you sure you want to delete deal "${name}"? This cannot be undone.`}
        confirmLabel="Delete Deal"
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
