"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Pencil, X, Trash2 } from "lucide-react";
import { createTaskAction, updateTaskAction, deleteTaskAction } from "@/app/actions/crm-actions";
import { ConfirmModal } from "@/app/dashboard/components/confirm-modal";
import type { Project, Task } from "@/types/crm";

const INPUT = "w-full rounded-xl border-2 border-[#1E293B] bg-[#FFFDF5] p-2 text-xs font-medium text-[#1E293B] focus:outline-none focus:shadow-pop-sm";

export function TaskModal({ projects, initialData }: { projects: Project[]; initialData?: Task }) {
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
      if (!projectId) {
        throw new Error("Please select a project for this task.");
      }

      const data = {
        title: (form.get("title") as string)?.trim(),
        project_id: projectId,
        priority: (form.get("priority") as any) || "medium",
        status: (form.get("status") as any) || (isEdit ? initialData?.status : "todo"),
        due_date: (form.get("due_date") as string) || null,
        description: (form.get("description") as string) || "",
      };

      if (!data.title) {
        throw new Error("Task title is required.");
      }

      if (isEdit) {
        await updateTaskAction(initialData!.id, data);
      } else {
        await createTaskAction(data);
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save task.");
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
          title="Edit Task"
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
        <CheckSquare className="h-4 w-4" strokeWidth={2.5} />
        Add Task
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md transform overflow-y-auto max-h-[90vh] rounded-2xl bg-white border-2 border-[#1E293B] p-6 text-left shadow-pop-lg transition-all">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E293B]/10">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500 border-2 border-[#1E293B]" />
            <h3 className="text-lg font-black text-[#1E293B]">{isEdit ? "Edit Task" : "Create New Task"}</h3>
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
            <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Task Title *</label>
            <input
              type="text"
              name="title"
              required
              defaultValue={initialData?.title}
              placeholder="e.g. Design 3 Reels for Meta Ads"
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
            <div>
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Due Date</label>
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
              <label className="block text-xs font-black uppercase text-[#1E293B] mb-1">Status</label>
              <select
                name="status"
                defaultValue={initialData?.status || "todo"}
                className={INPUT}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
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
              placeholder="Details, deliverable link, guidelines..."
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
              {loading ? "Saving..." : isEdit ? "Update Task" : "Save Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteTaskButton({ id, name, projectId }: { id: string; name: string; projectId?: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteTaskAction(id, projectId);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to delete task.");
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
        className="p-1.5 rounded-lg border-2 border-[#1E293B] bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
        title="Delete Task"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete task "${name}"? This cannot be undone.`}
        confirmText="Yes, Delete Task"
        loading={loading}
        error={error}
      />
    </>
  );
}
