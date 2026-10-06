"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck } from "lucide-react";
import { convertLeadAction } from "@/app/actions/crm-actions";
import { ConfirmModal } from "../components/confirm-modal";

export function ConvertButton({ leadId, leadName }: { leadId: string; leadName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleConvert = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await convertLeadAction(leadId);
      if (res) {
        setIsOpen(false);
        router.push(`/dashboard/clients`);
      } else {
        setError("Failed to convert lead.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to convert lead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#1E293B] bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-950 shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 transition-all cursor-pointer"
        title="Convert to Client"
      >
        <UserCheck className="h-3.5 w-3.5 text-emerald-700" strokeWidth={2.5} />
        Convert to Client
      </button>

      <ConfirmModal
        isOpen={isOpen}
        title="Convert Lead"
        message={`Convert lead "${leadName}" into an active WexLogic Client? Full relationship and activity history will be preserved.`}
        confirmLabel="Convert to Client"
        loading={loading}
        errorMessage={error}
        onConfirm={handleConvert}
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
