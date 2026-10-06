"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { insertClient } from "@/app/actions/wexlogic-actions";
import { updateClientAction, deleteClientAction } from "@/app/actions/crm-actions";
import { UserPlus, Pencil, X, Trash2 } from "lucide-react";
import type { Client } from "@/types/crm";
import { ConfirmModal } from "../components/confirm-modal";

export function ClientForm({ initialData }: { initialData?: Client }) {
  const isEdit = !!initialData;
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const name = (form.get("name") as string)?.trim();
      if (!name) {
        throw new Error("Client name is required.");
      }

      if (isEdit) {
        await updateClientAction(initialData!.id, {
          name,
          company_name: (form.get("company_name") as string) || "",
          email: (form.get("email") as string) || "",
          phone: (form.get("phone") as string) || null,
        });
        setIsOpen(false);
        router.refresh();
      } else {
        const res = await insertClient(null, form);
        if (res?.error) {
          setError(res.error);
        } else if (res?.success) {
          setIsOpen(false);
          router.refresh();
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save client.");
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
          title="Edit Client"
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
        className="inline-flex items-center gap-2 rounded-full border-2 border-[#1E293B] bg-[#8B5CF6] px-4 py-2 text-sm font-bold text-white shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
      >
        <UserPlus className="h-4 w-4" strokeWidth={2.5} />
        Add Client
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md transform overflow-y-auto max-h-[90vh] rounded-2xl bg-white border-2 border-[#1E293B] p-6 text-left align-middle shadow-pop-lg transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E293B]/10">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#8B5CF6] border-2 border-[#1E293B]" />
            <h3 className="text-xl font-black text-[#1E293B]">{isEdit ? "Edit Client" : "Add New Client"}</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg border-2 border-[#1E293B] bg-slate-50 text-[#1E293B] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 border-2 border-rose-400 p-3 text-sm font-bold text-rose-700">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-xs font-black uppercase tracking-wider text-[#1E293B] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              defaultValue={initialData?.name}
              placeholder="e.g. John Smith"
              className="block w-full rounded-xl border-2 border-[#1E293B] bg-[#FFFDF5] p-2.5 text-sm font-medium text-[#1E293B] placeholder-slate-400 focus:outline-none focus:shadow-pop-sm transition-all"
            />
          </div>
          <div>
            <label htmlFor="company_name" className="block text-xs font-black uppercase tracking-wider text-[#1E293B] mb-1">
              Company Name *
            </label>
            <input
              type="text"
              name="company_name"
              id="company_name"
              required
              defaultValue={initialData?.company_name}
              placeholder="e.g. Acme Corp"
              className="block w-full rounded-xl border-2 border-[#1E293B] bg-[#FFFDF5] p-2.5 text-sm font-medium text-[#1E293B] placeholder-slate-400 focus:outline-none focus:shadow-pop-sm transition-all"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs font-black uppercase tracking-wider text-[#1E293B] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              defaultValue={initialData?.email}
              placeholder="e.g. john@acme.com"
              className="block w-full rounded-xl border-2 border-[#1E293B] bg-[#FFFDF5] p-2.5 text-sm font-medium text-[#1E293B] placeholder-slate-400 focus:outline-none focus:shadow-pop-sm transition-all"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-xs font-black uppercase tracking-wider text-[#1E293B] mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              defaultValue={initialData?.phone || ""}
              placeholder="e.g. +91 98765 43210"
              className="block w-full rounded-xl border-2 border-[#1E293B] bg-[#FFFDF5] p-2.5 text-sm font-medium text-[#1E293B] placeholder-slate-400 focus:outline-none focus:shadow-pop-sm transition-all"
            />
          </div>
          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border-2 border-[#1E293B] bg-slate-100 px-4 py-2 text-sm font-bold text-[#1E293B] shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center items-center rounded-full border-2 border-[#1E293B] bg-[#8B5CF6] px-5 py-2 text-sm font-bold text-white shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Saving..." : isEdit ? "Update Client" : "Save Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteClientButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteClientAction(id);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to delete client.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-lg border-2 border-[#1E293B] bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
        title="Delete Client"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        title="Delete Client"
        message={`Are you sure you want to delete client "${name}"? This cannot be undone.`}
        confirmLabel="Delete Client"
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
