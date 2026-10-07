"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X } from "lucide-react";

interface UserFormProps {
  userRole?: string | null;
}

export function UserForm({ userRole = "admin" }: UserFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isAdmin = userRole === "admin";
  const isManager = userRole === "manager";

  if (!isAdmin && !isManager) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            role,
            password: password || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to create user");
          return;
        }

        setIsOpen(false);
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-full border-2 border-[#1E293B] bg-[#8B5CF6] px-4 py-2 text-sm font-bold text-white shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
      >
        <UserPlus className="h-4 w-4" strokeWidth={2.5} />
        Create CRM User
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#1E293B] dark:border-slate-800 p-6 text-left align-middle shadow-pop-lg transition-all">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E293B]/10 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#8B5CF6] border-2 border-[#1E293B] dark:border-slate-700" />
            <h3 className="text-xl font-black text-[#1E293B] dark:text-slate-100">Create CRM User</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg border-2 border-[#1E293B] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#1E293B] dark:text-slate-300 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-400 dark:border-rose-900 p-3 text-sm font-bold text-rose-700 dark:text-rose-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                required
                className="block w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2.5 text-sm font-medium text-[#1E293B] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:shadow-pop-sm transition-all"
                placeholder="Rahul"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                className="block w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2.5 text-sm font-medium text-[#1E293B] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:shadow-pop-sm transition-all"
                placeholder="Sharma"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="block w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2.5 text-sm font-medium text-[#1E293B] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:shadow-pop-sm transition-all"
              placeholder="rahul@example.com"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-300 mb-1">
              CRM Role
            </label>
            <select
              name="role"
              id="role"
              defaultValue="employee"
              className="block w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2.5 text-sm font-medium text-[#1E293B] dark:text-slate-100 focus:outline-none focus:shadow-pop-sm transition-all"
            >
              <option value="employee">Employee (Basic View Access)</option>
              <option value="sales">Sales (Clients & Revenue Operations)</option>
              {isAdmin && (
                <>
                  <option value="manager">Manager (Clients & Revenue Management)</option>
                  <option value="admin">Admin (Full System Control)</option>
                  <option value="viewer">Viewer (Read-Only Access)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-300 mb-1">
              Initial Password (Min 8 characters)
            </label>
            <input
              type="password"
              name="password"
              id="password"
              minLength={8}
              required
              className="block w-full rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-[#FFFDF5] dark:bg-slate-800 p-2.5 text-sm font-medium text-[#1E293B] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:shadow-pop-sm transition-all"
              placeholder="••••••••••••"
            />
            <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              User will log in using this initial password.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border-2 border-[#1E293B] dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-bold text-[#1E293B] dark:text-slate-300 shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex justify-center items-center rounded-full border-2 border-[#1E293B] dark:border-slate-900 bg-[#8B5CF6] px-5 py-2 text-sm font-bold text-white shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 transition-all cursor-pointer"
            >
              {isPending ? "Creating User..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
