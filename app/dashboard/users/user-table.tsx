"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ShieldCheck, UserCheck } from "lucide-react";
import { ConfirmModal } from "../components/confirm-modal";

export type UserItem = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: number;
  lastSignInAt: number | null;
};

const ROLE_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  admin: {
    bg: "bg-purple-100",
    text: "text-purple-950",
    border: "border-purple-400",
  },
  manager: {
    bg: "bg-sky-100",
    text: "text-sky-950",
    border: "border-sky-400",
  },
  sales: {
    bg: "bg-emerald-100",
    text: "text-emerald-950",
    border: "border-emerald-400",
  },
  employee: {
    bg: "bg-slate-100",
    text: "text-slate-900",
    border: "border-slate-300",
  },
};

export function UserTable({
  users,
  currentUserId,
  currentUserRole = "admin",
}: {
  users: UserItem[];
  currentUserId?: string;
  currentUserRole?: string | null;
}) {
  const isAdmin = currentUserRole === "admin";
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; email: string } | null>(null);
  const router = useRouter();

  const handleRevokeConfirm = () => {
    if (!revokeTarget) return;

    setActionError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users?id=${revokeTarget.id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) {
          setActionError(data.error || "Failed to delete user");
          return;
        }
        setRevokeTarget(null);
        router.refresh();
      } catch (err: unknown) {
        setActionError(
          err instanceof Error ? err.message : "Failed to revoke user"
        );
      }
    });
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setActionError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, role: newRole }),
        });
        const data = await res.json();
        if (!res.ok) {
          setActionError(data.error || "Failed to update role");
          return;
        }
        router.refresh();
      } catch (err: unknown) {
        setActionError(
          err instanceof Error ? err.message : "Failed to update role"
        );
      }
    });
  };

  return (
    <div className="space-y-4">
      {!isAdmin && (
        <div className="rounded-2xl bg-sky-50 border-2 border-[#1E293B] p-3 text-xs font-bold text-sky-950 shadow-pop-sm flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded-lg bg-white border border-[#1E293B] text-sky-700 font-black uppercase text-[10px]">
            Manager Mode
          </span>
          <span>
            You have directory visibility and staff onboarding permissions. Role changes and account revocations require Administrator privileges.
          </span>
        </div>
      )}

      {actionError && (
        <div className="rounded-xl bg-rose-50 border-2 border-rose-400 p-3 text-sm font-bold text-rose-700">
          {actionError}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-[#1E293B]/10">
            <thead className="bg-[#FFFDF5] border-b-2 border-[#1E293B]">
              <tr>
                <th
                  scope="col"
                  className="py-4 pl-4 pr-3 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] sm:pl-6"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]"
                >
                  Created
                </th>
                <th
                  scope="col"
                  className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]"
                >
                  Last Login
                </th>
                <th
                  scope="col"
                  className="relative py-4 pl-3 pr-4 sm:pr-6 text-right text-xs font-black uppercase tracking-wider text-[#1E293B]"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1E293B]/10 bg-white">
              {users.map((user) => {
                const badge = ROLE_BADGES[user.role] || ROLE_BADGES.employee;
                const isSelf = user.id === currentUserId;

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-violet-50/40 transition-colors"
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-[#1E293B] sm:pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-violet-100 border-2 border-[#1E293B] flex items-center justify-center text-[#8B5CF6] font-black text-sm shrink-0">
                          {user.fullName.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-[#1E293B]">
                            {user.fullName}
                            {isSelf && (
                              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-full font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {isAdmin && !isSelf ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={isPending}
                          aria-label={`Change role for ${user.fullName}`}
                          className={`text-xs font-black uppercase tracking-wider rounded-xl border-2 border-[#1E293B] px-2.5 py-1 shadow-pop-sm focus:outline-none cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all ${badge.bg} ${badge.text}`}
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="sales">Sales</option>
                          <option value="employee">Employee</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-black border-2 shadow-pop-sm ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {user.role === "admin" ? (
                            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                          )}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-500">
                      {user.lastSignInAt
                        ? new Date(user.lastSignInAt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      {isAdmin && !isSelf ? (
                        <button
                          onClick={() => setRevokeTarget({ id: user.id, email: user.email })}
                          disabled={isPending}
                          className="p-1.5 rounded-lg border-2 border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-500 shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
                          title="Revoke CRM Access"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                      ) : (
                        <span className="text-slate-300 font-bold text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-sm font-medium text-slate-400"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!revokeTarget}
        title="Revoke CRM Access"
        message={revokeTarget ? `Are you sure you want to revoke CRM access for ${revokeTarget.email}? This user will no longer be able to log in.` : ""}
        confirmLabel="Revoke Access"
        isDanger
        loading={isPending}
        errorMessage={actionError}
        onConfirm={handleRevokeConfirm}
        onCancel={() => {
          if (!isPending) {
            setRevokeTarget(null);
            setActionError(null);
          }
        }}
      />
    </div>
  );
}
