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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-white border-2 border-[#1E293B] p-6 shadow-pop-lg text-left animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E293B]/10">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-xl border border-[#1E293B] ${
                resolvedVariant === "danger"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <h3 className="text-sm font-black text-[#1E293B]">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1 rounded-lg border-2 border-[#1E293B] bg-slate-50 text-[#1E293B] hover:bg-slate-100 cursor-pointer disabled:opacity-50"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {resolvedError && (
          <div className="mt-3 p-2.5 rounded-xl border-2 border-rose-300 bg-rose-50 text-xs font-bold text-rose-700">
            {resolvedError}
          </div>
        )}

        <p className="mt-4 text-xs font-medium text-slate-600 leading-relaxed">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-xl border-2 border-[#1E293B] bg-slate-100 px-4 py-2 text-xs font-bold text-[#1E293B] hover:bg-slate-200 transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl border-2 border-[#1E293B] px-4 py-2 text-xs font-black shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer disabled:opacity-50 ${
              resolvedVariant === "danger"
                ? "bg-rose-600 text-white"
                : "btn-primary"
            }`}
          >
            {loading ? "Processing..." : resolvedConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
