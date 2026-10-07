"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity as ActivityIcon, Pencil, X, Trash2 } from "lucide-react";
import { createActivityAction, updateActivityAction, deleteActivityAction } from "@/app/actions/crm-actions";
import type { Client, Project, Activity } from "@/types/crm";
import { ConfirmModal } from "../components/confirm-modal";

const INPUT = "w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2 text-xs font-medium text-[#1E293B] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:shadow-pop-sm";

export function ActivityModal({
  clients,
  projects,
  initialData,
}: {
  clients: Client[];
  projects: Project[];
  initialData?: Activity;
}) {
  const isEdit = !!initialData;
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const data = {
      title: form.get("title") as string,
      type: (form.get("type") as any) || "meeting",
      client_id: (form.get("client_id") as string) || null,
      project_id: (form.get("project_id") as string) || null,
      description: form.get("description") as string,
    };

    if (isEdit) {
      await updateActivityAction(initialData!.id, data);
    } else {
      await createActivityAction(data);
    }

    setLoading(false);
    setIsOpen(false);
    router.refresh();
  };

  if (!isOpen) {
    if (isEdit) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className="p-1.5 rounded-lg border-2 border-[#1E293B] dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all cursor-pointer"
          title="Edit Activity"
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      );
    }
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1E293B] dark:border-pink-500/40 btn-primary px-4 py-2 text-xs font-black shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer"
      >
        <ActivityIcon className="h-4 w-4" strokeWidth={2.5} />
        Log Activity
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/40 dark:bg-slate-950/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md transform overflow-y-auto max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#1E293B] dark:border-slate-700 p-6 text-left shadow-pop-lg transition-all">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E293B]/10 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-pink-500 border-2 border-[#1E293B] dark:border-pink-400" />
            <h3 className="text-lg font-black text-[#1E293B] dark:text-slate-100">{isEdit ? "Edit Activity" : "Log Interaction Activity"}</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg border-2 border-[#1E293B] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#1E293B] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              required
              defaultValue={initialData?.title}
              placeholder="e.g. Budget Negotiation Meeting with Client"
              className={INPUT}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Type</label>
              <select
                name="type"
                defaultValue={initialData?.type || "meeting"}
                className={INPUT}
              >
                <option value="meeting" className="dark:bg-slate-900 dark:text-slate-100">Meeting</option>
                <option value="call" className="dark:bg-slate-900 dark:text-slate-100">Phone Call</option>
                <option value="whatsapp" className="dark:bg-slate-900 dark:text-slate-100">WhatsApp</option>
                <option value="email" className="dark:bg-slate-900 dark:text-slate-100">Email</option>
                <option value="follow_up" className="dark:bg-slate-900 dark:text-slate-100">Follow Up</option>
                <option value="note" className="dark:bg-slate-900 dark:text-slate-100">Internal Note</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Client</label>
              <select
                name="client_id"
                defaultValue={initialData?.client_id || ""}
                className={INPUT}
              >
                <option value="" className="dark:bg-slate-900 dark:text-slate-100">None / General</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="dark:bg-slate-900 dark:text-slate-100">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Project</label>
            <select
              name="project_id"
              defaultValue={initialData?.project_id || ""}
              className={INPUT}
            >
              <option value="" className="dark:bg-slate-900 dark:text-slate-100">None / General</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-slate-900 dark:text-slate-100">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Description / Summary</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={initialData?.description || ""}
              placeholder="Key decisions, discussion points, action items agreed..."
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
              className="rounded-xl border-2 border-[#1E293B] dark:border-pink-500/40 btn-primary px-5 py-2 text-xs font-black shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer"
            >
              {loading ? "Saving..." : isEdit ? "Update Activity" : "Log Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteActivityButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteActivityAction(id);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to delete activity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-lg border-2 border-[#1E293B] dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all cursor-pointer"
        title="Delete Activity"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        title="Delete Activity"
        message={`Are you sure you want to delete activity "${title}"? This cannot be undone.`}
        confirmLabel="Delete Activity"
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
