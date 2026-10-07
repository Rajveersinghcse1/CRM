"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, AlertCircle } from "lucide-react";
import {
  createProjectCategoryAction,
  updateProjectCategoryAction,
  deleteProjectCategoryAction,
} from "@/app/actions/crm-actions";
import { ConfirmModal } from "@/app/dashboard/components/confirm-modal";
import type { ProjectCategory } from "@/types/crm";

export function CategoryModal({
  projectId,
  initialData,
}: {
  projectId: string;
  initialData?: ProjectCategory;
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
    const form = new FormData(e.currentTarget);

    const name = (form.get("name") as string)?.trim();
    const budget = Number(form.get("budget")) || 0;

    if (!name) {
      setError("Please provide a category name.");
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        await updateProjectCategoryAction(initialData!.id, { name, budget }, projectId);
      } else {
        await createProjectCategoryAction({
          project_id: projectId,
          name,
          budget,
        });
      }
      setLoading(false);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error("Error saving category:", err);
      setError(err?.message || "Failed to save category. Please try again.");
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
          className="p-1.5 rounded-lg border-2 border-[#1E293B] dark:border-slate-700 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all cursor-pointer"
          title="Edit Category"
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
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 btn-primary px-3.5 py-1.5 text-xs font-black shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        Add Category
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#1E293B] dark:border-slate-800 p-6 text-left shadow-pop-lg">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E293B]/10 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#8B5CF6] border-2 border-[#1E293B] dark:border-slate-700" />
            <h3 className="text-lg font-black text-[#1E293B] dark:text-slate-100">
              {isEdit ? "Edit Work Category" : "Add Work Category"}
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg border-2 border-[#1E293B] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#1E293B] dark:text-slate-200 cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 p-2.5 bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-400 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-400 text-xs font-bold">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={initialData?.name}
              placeholder="e.g. Meta Ads, Decoration, Modeling, Sound"
              className="w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2 text-xs font-medium text-[#1E293B] dark:text-slate-100 dark:placeholder-slate-500 focus:outline-none focus:shadow-pop-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#1E293B] dark:text-slate-300 mb-1">
              Allocated Budget (₹) *
            </label>
            <input
              type="number"
              name="budget"
              required
              min="0"
              defaultValue={initialData?.budget}
              placeholder="100000"
              className="w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2 text-xs font-medium text-[#1E293B] dark:text-slate-100 dark:placeholder-slate-500 focus:outline-none focus:shadow-pop-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-[#1E293B] dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl border-2 border-[#1E293B] dark:border-slate-700 btn-primary px-5 py-2 text-xs font-black shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : isEdit ? "Update Category" : "Allocate Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteCategoryButton({
  id,
  name,
  projectId,
}: {
  id: string;
  name: string;
  projectId?: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteProjectCategoryAction(id, projectId);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error("Error deleting category:", err);
      setError(err?.message || "Failed to delete category.");
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
        className="p-1.5 rounded-lg border-2 border-[#1E293B] dark:border-slate-700 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all cursor-pointer disabled:opacity-50"
        title="Delete Category"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${name}"? Allocated budget partitioning for this category will be deleted.`}
        confirmText="Yes, Delete Category"
        loading={loading}
        error={error}
      />
    </>
  );
}
