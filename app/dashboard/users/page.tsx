import { clerkClient } from "@clerk/nextjs/server";
import { requireRole, type CrmRole } from "@/utils/auth";
import { UserForm } from "./user-form";
import { UserTable, type UserItem } from "./user-table";
import { Users, Shield, Briefcase, UserCheck } from "lucide-react";

export default async function UsersPage() {
  const { user: currentUserData, role } = await requireRole(["admin", "manager"]);
  const isAdmin = role === "admin";

  const client = await clerkClient();
  const { data: rawUsers } = await client.users.getUserList({
    limit: 100,
    orderBy: "-created_at",
  });

  const users: UserItem[] = rawUsers.map((u) => ({
    id: u.id,
    fullName:
      `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
      u.emailAddresses[0]?.emailAddress ||
      "Unnamed",
    email: u.emailAddresses[0]?.emailAddress ?? "",
    role: (u.publicMetadata?.role as CrmRole) || "employee",
    createdAt: u.createdAt,
    lastSignInAt: u.lastSignInAt,
  }));

  const roleCounts = users.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b-2 border-[#1E293B]/10 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-pink-100 dark:bg-pink-950/60 border-2 border-[#1E293B] dark:border-slate-700">
              <Shield className="h-4 w-4 text-[#DB2777] dark:text-pink-400" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-[#1E293B] dark:text-slate-100 font-display">
              User Management
            </h2>
            {!isAdmin && (
              <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 dark:bg-sky-950/60 text-sky-900 dark:text-sky-300 border border-sky-400 dark:border-sky-800 px-2.5 py-0.5 rounded-full shadow-pop-sm">
                Manager Access
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
            {isAdmin
              ? "Admin console to create and authorize internal CRM team members and manage role permissions."
              : "Team member directory. As Manager, you can onboard employee/sales staff. Role changes and revocations require Admin privileges."}
          </p>
        </div>
        <UserForm userRole={role} />
      </div>

      {/* Role Distribution Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Admins */}
        <div className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-950/60 border-2 border-[#1E293B] dark:border-slate-700 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0 shadow-pop-sm">
              <Shield className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Admins
              </p>
              <p className="text-2xl font-black text-[#1E293B] dark:text-slate-100 mt-0.5">
                {roleCounts.admin || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Managers */}
        <div className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-sky-100 dark:bg-sky-950/60 border-2 border-[#1E293B] dark:border-slate-700 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0 shadow-pop-sm">
              <Briefcase className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Managers
              </p>
              <p className="text-2xl font-black text-[#1E293B] dark:text-slate-100 mt-0.5">
                {roleCounts.manager || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Sales */}
        <div className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-[#1E293B] dark:border-slate-700 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0 shadow-pop-sm">
              <UserCheck className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sales
              </p>
              <p className="text-2xl font-black text-[#1E293B] dark:text-slate-100 mt-0.5">
                {roleCounts.sales || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Employees */}
        <div className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-[#1E293B] dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 shadow-pop-sm">
              <Users className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Employees
              </p>
              <p className="text-2xl font-black text-[#1E293B] dark:text-slate-100 mt-0.5">
                {roleCounts.employee || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="mt-8 flow-root">
        <UserTable
          users={users}
          currentUserId={currentUserData.id}
          currentUserRole={role}
        />
      </div>
    </div>
  );
}
