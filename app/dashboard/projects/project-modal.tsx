"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, Pencil, X, Trash2 } from "lucide-react";
import { createProjectAction, updateProjectAction, deleteProjectAction } from "@/app/actions/crm-actions";
import { ConfirmModal } from "@/app/dashboard/components/confirm-modal";
import type { Client, Project } from "@/types/crm";

const INPUT = "w-full rounded-xl border-2 border-[#1E293B] bg-[#FFFDF5] p-2 text-xs font-medium text-[#1E293B] focus:outline-none focus:shadow-pop-sm";

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
          className="p-1.5 rounded-lg border-2 border-[#1E293B] bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer"
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
        className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1E293B] btn-primary px-4 py-2 text-xs font-black shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
      >
        <FolderPlus className="h-4 w-4" strokeWidth={2.5} />
        Create Project
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg transform overflow-y-auto max-h-[90vh] rounded-2xl bg-white border-2 border-[#1E293B] p-6 text-left shadow-pop-lg transition-all">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E293B]/10">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#8B5CF6] border-2 border-[#1E293B]" />
            <h3 className="text-lg font-black text-[#1E293B]">{isEdit ? "Edit Project" : "Create New Project"}</h3>
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
            <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Project Name *</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">
                Contract Value (?) *
              </label>
              <input
                type="number"
                name="project_value"
                required
                defaultValue={initialData?.project_value}
                placeholder="500000"
                className={INPUT}
              />
              <span className="text-[10px] font-semibold text-slate-500">Amount client agreed to pay</span>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">
                Overall Cost Budget (?) *
              </label>
              <input
                type="number"
                name="overall_budget"
                required
                defaultValue={initialData?.overall_budget}
                placeholder="400000"
                className={INPUT}
              />
              <span className="text-[10px] font-semibold text-slate-500">Internal delivery cost cap</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Start Date</label>
              <input
                type="date"
                name="start_date"
                defaultValue={initialData?.start_date || new Date().toISOString().split("T")[0]}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">End Date</label>
              <input
                type="date"
                name="end_date"
                defaultValue={initialData?.end_date || ""}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Priority</label>
              <select
                name="priority"
                defaultValue={initialData?.priority || "medium"}
                className={INPUT}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Status</label>
              <select
                name="status"
                defaultValue={initialData?.status || "active"}
                className={INPUT}
              >
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Description</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={initialData?.description || ""}
              placeholder="Scope, deliverables, key requirements..."
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
        className="p-1.5 rounded-lg border-2 border-[#1E293B] bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
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
