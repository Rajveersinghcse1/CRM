"use client";

import { AlertTriangle, X } from "lucide-react";

export function ConfirmModal({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmText,
  confirmLabel,
  cancelText = "Cancel",
  variant,
  isDanger,
  loading = false,
  error,
  errorMessage,
}: {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isDanger?: boolean;
  loading?: boolean;
  error?: string | null;
  errorMessage?: string | null;
}) {
  if (!isOpen) return null;

  const handleClose = onCancel || onClose || (() => {});
  const resolvedConfirmText = confirmLabel || confirmText || "Delete";
  const resolvedError = errorMessage || error || null;
  const resolvedVariant = isDanger ? "danger" : (variant || "danger");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xl text-left animate-in zoom-in-95 duration-150 overflow-hidden">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl flex-shrink-0 ${
                resolvedVariant === "danger"
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60"
                  : "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60"
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Action confirmation</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {resolvedError && (
          <div className="mt-3 p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/50 text-xs font-semibold text-rose-700 dark:text-rose-400 break-words">
            {resolvedError}
          </div>
        )}

        <div className="mt-4 text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed break-words">
          {message}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer disabled:opacity-50 ${
              resolvedVariant === "danger"
                ? "bg-rose-600 hover:bg-rose-700 active:bg-rose-800"
                : "bg-amber-600 hover:bg-amber-700 active:bg-amber-800"
            }`}
          >
            {loading ? "Processing..." : resolvedConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
