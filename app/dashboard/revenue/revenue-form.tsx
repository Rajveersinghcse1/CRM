"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { insertRevenue } from "@/app/actions/wexlogic-actions";
import { DollarSign, X } from "lucide-react";

type Client = {
  id: string;
  name: string;
  company_name: string;
};

type Service = {
  id: string;
  name: string;
  base_price: number | string;
};

type Props = {
  clients: Client[];
  services: Service[];
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center items-center rounded-full border-2 border-[#1E293B] dark:border-purple-500/50 bg-[#8B5CF6] hover:bg-[#7C3AED] px-5 py-2 text-sm font-bold text-white shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 transition-all cursor-pointer"
    >
      {pending ? "Saving Payment..." : "Save Payment"}
    </button>
  );
}

export function RevenueForm({ clients, services }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formAction = async (formData: FormData) => {
    setError(null);
    const res = await insertRevenue(null, formData);
    if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      setIsOpen(false);
    }
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isClientsEmpty = clients.length === 0;
  const isServicesEmpty = services.length === 0;

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-full border-2 border-[#1E293B] dark:border-purple-500/40 bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 py-2 text-sm font-bold text-white shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
      >
        <DollarSign className="h-4 w-4" strokeWidth={2.5} />
        Log Payment
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/40 dark:bg-slate-950/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#1E293B] dark:border-slate-700 p-6 text-left align-middle shadow-pop-lg transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E293B]/10 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#D97706] border-2 border-[#1E293B] dark:border-amber-500" />
            <h3 className="text-xl font-black text-[#1E293B] dark:text-slate-100">Log New Payment</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg border-2 border-[#1E293B] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#1E293B] dark:text-slate-300 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        <form action={formAction} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-400 dark:border-rose-800 p-3 text-sm font-bold text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="client_id" className="block text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-300 mb-1">
              Client
            </label>
            <select
              name="client_id"
              id="client_id"
              required
              disabled={isClientsEmpty}
              className="block w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2.5 text-sm font-medium text-[#1E293B] dark:text-slate-100 focus:outline-none focus:shadow-pop-sm transition-all disabled:opacity-50"
            >
              {isClientsEmpty ? (
                <option value="" className="dark:bg-slate-900 dark:text-slate-100">No clients found</option>
              ) : (
                <>
                  <option value="" className="dark:bg-slate-900 dark:text-slate-100">Select a client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} className="dark:bg-slate-900 dark:text-slate-100">
                      {c.name} ({c.company_name})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="service_id" className="block text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-300 mb-1">
              Service
            </label>
            <select
              name="service_id"
              id="service_id"
              required
              disabled={isServicesEmpty}
              className="block w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2.5 text-sm font-medium text-[#1E293B] dark:text-slate-100 focus:outline-none focus:shadow-pop-sm transition-all disabled:opacity-50"
            >
              {isServicesEmpty ? (
                <option value="" className="dark:bg-slate-900 dark:text-slate-100">No services found</option>
              ) : (
                <>
                  <option value="" className="dark:bg-slate-900 dark:text-slate-100">Select a service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id} className="dark:bg-slate-900 dark:text-slate-100">
                      {s.name} - {formatINR(Number(s.base_price))}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-300 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="amount"
              id="amount"
              required
              placeholder="e.g. 25000"
              className="block w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2.5 text-sm font-medium text-[#1E293B] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:shadow-pop-sm transition-all"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-300 mb-1">
              Payment Status
            </label>
            <select
              name="status"
              id="status"
              required
              className="block w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2.5 text-sm font-medium text-[#1E293B] dark:text-slate-100 focus:outline-none focus:shadow-pop-sm transition-all"
            >
              <option value="pending" className="dark:bg-slate-900 dark:text-slate-100">Pending</option>
              <option value="paid" className="dark:bg-slate-900 dark:text-slate-100">Paid</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border-2 border-[#1E293B] dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-bold text-[#1E293B] dark:text-slate-300 shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
