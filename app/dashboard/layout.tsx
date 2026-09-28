import Image from "next/image";
import { LogOut } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import { getUserRole } from "@/app/actions/wexlogic-actions";
import { getUserDisplayName } from "@/utils/auth";
import { MobileNav } from "./components/MobileNav";
import { SidebarNav } from "./components/SidebarNav";

import { WexLogicLogo } from "@/components/wexlogic-logo";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const displayName = getUserDisplayName(user);
  const role = await getUserRole();

  const roleBadges: Record<string, { bg: string; text: string; border: string; label: string }> = {
    admin: { bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-400", label: "Admin" },
    manager: { bg: "bg-sky-100", text: "text-sky-900", border: "border-sky-400", label: "Manager" },
    sales: { bg: "bg-emerald-100", text: "text-emerald-900", border: "border-emerald-400", label: "Sales" },
    employee: { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-300", label: "Employee" },
    viewer: { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-300", label: "Viewer" },
  };
  const activeBadge = roleBadges[role || "employee"] || roleBadges.employee;

  return (
    <div className="flex h-screen bg-[#FFFDF5] text-[#1E293B] flex-col md:flex-row overflow-hidden font-sans print:h-auto print:overflow-visible print:bg-white">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r-2 border-[#1E293B] relative flex-col shrink-0 shadow-pop-sm z-10 print:hidden">
        {/* Brand Header */}
        <div className="flex h-20 shrink-0 items-center justify-center border-b-2 border-[#1E293B] bg-[#FFFDF5] px-4">
          <WexLogicLogo href="/dashboard" size="md" />
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="px-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-300 rounded px-2 py-0.5">
              Menu
            </span>
          </div>
          <SidebarNav role={role} />
        </div>

        {/* User Card & Sign Out */}
        <div className="shrink-0 p-4 border-t-2 border-[#1E293B] bg-white space-y-3">
          <div className="flex items-center justify-between p-2.5 bg-[#FFFDF5] border-2 border-[#1E293B] rounded-2xl shadow-pop-sm">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-black text-[#1E293B] truncate">{displayName}</p>
              <div className="inline-block mt-0.5">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${activeBadge.bg} ${activeBadge.text} ${activeBadge.border}`}
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
              className="flex w-full items-center justify-center gap-2 px-3 py-2 text-xs font-black text-rose-700 bg-rose-50 border-2 border-[#1E293B] rounded-xl shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" strokeWidth={2.5} />
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FFFDF5] print:overflow-visible print:h-auto print:bg-white">
        {/* Mobile Navigation Header */}
        <div className="print:hidden">
          <MobileNav email={displayName} role={role} />
        </div>

        {/* Main Scrollable View */}
        <main className="flex-1 overflow-y-auto print:overflow-visible print:h-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto print:p-0 print:m-0 print:max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
