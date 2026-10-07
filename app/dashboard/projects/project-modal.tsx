"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, Pencil, X, Trash2 } from "lucide-react";
import { createProjectAction, updateProjectAction, deleteProjectAction } from "@/app/actions/crm-actions";
import { ConfirmModal } from "@/app/dashboard/components/confirm-modal";
import type { Client, Project } from "@/types/crm";

const INPUT = "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition-all";

export function ProjectModal({
  clients,
  initialData,
}: {
  clients: Client[];
  initialData?: Project;
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
      const clientId = form.get("client_id") as string;
      const name = (form.get("name") as string)?.trim();

      if (!name) {
        throw new Error("Project name is required.");
      }
      if (!clientId) {
        throw new Error("Please select a client for this project.");
      }

      const data = {
        name,
        client_id: clientId,
        project_value: Number(form.get("project_value")) || 0,
        overall_budget: Number(form.get("overall_budget")) || 0,
        start_date: (form.get("start_date") as string) || new Date().toISOString().split("T")[0],
        end_date: (form.get("end_date") as string) || null,
        priority: (form.get("priority") as "low" | "medium" | "high" | "urgent") || "medium",
        status: (form.get("status") as any) || (isEdit ? initialData?.status : "active"),
        description: (form.get("description") as string) || "",
      };

      if (isEdit) {
        await updateProjectAction(initialData!.id, data);
        setIsOpen(false);
        router.refresh();
      } else {
        const project = await createProjectAction({ ...data, status: "active" });
        setIsOpen(false);
        router.push(`/dashboard/projects/${project.id}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save project.");
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
          className="p-1.5 rounded-lg border-2 border-[#1E293B] dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all cursor-pointer"
          title="Edit Project"
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
        className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1E293B] dark:border-indigo-500/40 btn-primary px-4 py-2 text-xs font-black shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
      >
        <FolderPlus className="h-4 w-4" strokeWidth={2.5} />
        Create Project
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg transform overflow-y-auto max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 text-left shadow-2xl transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-950/50" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{isEdit ? "Edit Project" : "Create New Project"}</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl border-2 border-rose-300 bg-rose-50 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Project Name *</label>
            <input
              type="text"
              name="name"
              required
              defaultValue={initialData?.name}
              placeholder="e.g. Garba Event 2026"
              className={INPUT}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Client *</label>
            <select
              name="client_id"
              required
              defaultValue={initialData?.client_id || (clients[0]?.id || "")}
              className={INPUT}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="dark:bg-slate-900 dark:text-slate-100">
                  {c.name} ({c.company_name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Contract Value (₹) *
              </label>
              <input
                type="number"
                name="project_value"
                required
                min="0"
                step="any"
                defaultValue={initialData?.project_value}
                placeholder="60000"
                className={INPUT}
              />
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Total amount client agreed to pay</span>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Cost Budget (₹) <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="number"
                name="overall_budget"
                min="0"
                step="any"
                defaultValue={initialData?.overall_budget || ""}
                placeholder="e.g. 25000"
                className={INPUT}
              />
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Optional internal spending cap</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                name="start_date"
                defaultValue={initialData?.start_date || new Date().toISOString().split("T")[0]}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">End Date</label>
              <input
                type="date"
                name="end_date"
                defaultValue={initialData?.end_date || ""}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Priority</label>
              <select
                name="priority"
                defaultValue={initialData?.priority || "medium"}
                className={INPUT}
              >
                <option value="low" className="dark:bg-slate-900 dark:text-slate-100">Low</option>
                <option value="medium" className="dark:bg-slate-900 dark:text-slate-100">Medium</option>
                <option value="high" className="dark:bg-slate-900 dark:text-slate-100">High</option>
                <option value="urgent" className="dark:bg-slate-900 dark:text-slate-100">Urgent</option>
              </select>
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Status</label>
              <select
                name="status"
                defaultValue={initialData?.status || "active"}
                className={INPUT}
              >
                <option value="planned" className="dark:bg-slate-900 dark:text-slate-100">Planned</option>
                <option value="active" className="dark:bg-slate-900 dark:text-slate-100">Active</option>
                <option value="on_hold" className="dark:bg-slate-900 dark:text-slate-100">On Hold</option>
                <option value="completed" className="dark:bg-slate-900 dark:text-slate-100">Completed</option>
                <option value="cancelled" className="dark:bg-slate-900 dark:text-slate-100">Cancelled</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">Description</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={initialData?.description || ""}
              placeholder="Scope, deliverables, key requirements..."
              className={INPUT}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : isEdit ? "Update Project" : "Save Project & Open Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteProjectButton({
  id,
  name,
  redirectUrl,
}: {
  id: string;
  name: string;
  redirectUrl?: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteProjectAction(id);
      setIsOpen(false);
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (typeof window !== "undefined" && window.location.pathname.includes(id)) {
        router.push("/dashboard/projects");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to delete project.");
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
        className="p-1.5 rounded-lg border-2 border-[#1E293B] dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all cursor-pointer"
        title="Delete Project"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${name}"? All related project categories, logs, and workspace items will be removed.`}
        confirmText="Yes, Delete Project"
        loading={loading}
        error={error}
      />
    </>
  );
}
