import Image from "next/image";
import { LogOut } from "lucide-react";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import { getCurrentUser, getUserDisplayName, getCurrentUserRole } from "@/utils/auth";
import { MobileNav } from "./components/MobileNav";
import { SidebarNav } from "./components/SidebarNav";

import { WexLogicLogo } from "@/components/wexlogic-logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const displayName = getUserDisplayName(user);
  const role = await getCurrentUserRole();

  const roleBadges: Record<string, { bg: string; text: string; border: string; label: string }> = {
    admin: { bg: "bg-indigo-50 dark:bg-indigo-950/60", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-800", label: "Admin" },
    manager: { bg: "bg-sky-50 dark:bg-sky-950/60", text: "text-sky-700 dark:text-sky-300", border: "border-sky-200 dark:border-sky-800", label: "Manager" },
    sales: { bg: "bg-emerald-50 dark:bg-emerald-950/60", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800", label: "Sales" },
    employee: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700", label: "Employee" },
    viewer: { bg: "bg-amber-50 dark:bg-amber-950/60", text: "text-amber-800 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800", label: "Viewer" },
  };
  const activeBadge = roleBadges[role || "employee"] || roleBadges.employee;

  return (
    <div className="flex min-h-screen md:h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#0F172A] dark:text-slate-100 flex-col md:flex-row md:overflow-hidden font-sans print:h-auto print:overflow-visible print:bg-white">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 relative flex-col shrink-0 shadow-sm z-10 print:hidden">
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-5">
          <WexLogicLogo href="/dashboard" size="md" />
          <ThemeToggle />
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="px-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workspace
            </span>
          </div>
          <SidebarNav role={role} />
        </div>

        {/* User Card & Sign Out */}
        <div className="shrink-0 p-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
          <div className="flex items-center justify-between p-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{displayName}</p>
              <div className="inline-block mt-0.5">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${activeBadge.bg} ${activeBadge.text} ${activeBadge.border}`}
                >
                  {activeBadge.label}
                </span>
              </div>
            </div>
            <UserButton />
          </div>

          <SignOutButton redirectUrl="/">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-800 hover:bg-rose-50/60 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:overflow-hidden bg-[#F8FAFC] dark:bg-slate-950 print:overflow-visible print:h-auto print:bg-white">
        {/* Mobile Navigation Header */}
        <div className="print:hidden">
          <MobileNav email={displayName} role={role} />
        </div>

        {/* Main Scrollable View */}
        <main className="flex-1 overflow-y-auto print:overflow-visible print:h-auto">
          <div className="p-3 sm:p-4 md:p-8 max-w-7xl mx-auto print:p-0 print:m-0 print:max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
