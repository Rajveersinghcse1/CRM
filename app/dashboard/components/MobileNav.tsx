"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { WexLogicLogo } from "@/components/wexlogic-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  UserPlus,
  Users,
  Building2,
  GitPullRequest,
  FolderKanban,
  Tags,
  CheckSquare,
  CreditCard,
  FileText,
  Receipt,
  FileSpreadsheet,
  PieChart,
  TrendingUp,
  Activity,
  Calendar,
  Truck,
  BarChart3,
  ShieldCheck,
  History,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

export function MobileNav({ email, role }: { email?: string; role: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { signOut } = useClerk();

  const effectiveRole = role || "admin";
  const isAdmin = effectiveRole === "admin";
  const isManager = effectiveRole === "manager";
  const isSales = effectiveRole === "sales";
  const isEmployee = effectiveRole === "employee";
  const isViewer = effectiveRole === "viewer";

  // Permissions per process stage
  const canAccessSales = isAdmin || isManager || isSales || isViewer;
  const canAccessCategories = isAdmin || isManager || isViewer;
  const canAccessTasks = isAdmin || isManager || isSales || isEmployee || isViewer;
  const canAccessActivities = isAdmin || isManager || isSales || isEmployee || isViewer;
  const canAccessVendors = isAdmin || isManager || isViewer;
  const canAccessClientBilling = isAdmin || isManager || isSales || isViewer;
  const canAccessExpenses = isAdmin || isManager || isSales || isEmployee || isViewer;
  const canAccessFinancialMargins = isAdmin || isManager || isViewer;
  const canAccessAnalytics = isAdmin || isManager || isSales || isViewer;
  const canAccessUserManagement = isAdmin || isManager;

  const sections = [
    // 1. Overview
    {
      title: "Overview",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-violet-600 bg-violet-100" },
      ],
    },

    // 2. Sales & Client Acquisition (Leads -> Pipeline Deals -> Clients -> Companies)
    ...(canAccessSales
      ? [
          {
            title: "Sales & Pipeline",
            items: [
              { href: "/dashboard/leads", label: "Leads", icon: UserPlus, color: "text-sky-600 bg-sky-100" },
              { href: "/dashboard/deals", label: "Deals Pipeline", icon: GitPullRequest, color: "text-amber-600 bg-amber-100" },
              { href: "/dashboard/clients", label: "Clients", icon: Users, color: "text-emerald-600 bg-emerald-100" },
              { href: "/dashboard/companies", label: "Companies", icon: Building2, color: "text-indigo-600 bg-indigo-100" },
            ],
          },
        ]
      : []),

    // 3. Projects & Operations (Projects -> Categories -> Tasks -> Calendar -> Activities)
    {
      title: "Projects & Operations",
      items: [
        { href: "/dashboard/projects", label: "Projects Hub", icon: FolderKanban, color: "text-purple-600 bg-purple-100" },
        ...(canAccessCategories
          ? [{ href: "/dashboard/categories", label: "Categories", icon: Tags, color: "text-teal-600 bg-teal-100" }]
          : []),
        ...(canAccessTasks
          ? [{ href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare, color: "text-blue-600 bg-blue-100" }]
          : []),
        { href: "/dashboard/calendar", label: "Calendar", icon: Calendar, color: "text-indigo-600 bg-indigo-100" },
        ...(canAccessActivities
          ? [{ href: "/dashboard/activities", label: "Activities", icon: Activity, color: "text-pink-600 bg-pink-100" }]
          : []),
      ],
    },

    // 4. Vendors & Procurement (Vendors -> Vendor Bills)
    ...(canAccessVendors
      ? [
          {
            title: "Vendors & Procurement",
            items: [
              { href: "/dashboard/vendors", label: "Vendors", icon: Truck, color: "text-amber-700 bg-amber-100" },
              { href: "/dashboard/vendor-bills", label: "Vendor Bills", icon: FileSpreadsheet, color: "text-orange-600 bg-orange-100" },
            ],
          },
        ]
      : []),

    // 5. Finance & Billing (Invoices -> Client Payments -> Expenses -> Budgets -> Margins)
    ...(canAccessClientBilling || canAccessExpenses
      ? [
          {
            title: "Finance & Accounts",
            items: [
              ...(canAccessClientBilling
                ? [
                    { href: "/dashboard/invoices", label: "Invoices", icon: FileText, color: "text-blue-600 bg-blue-100" },
                    { href: "/dashboard/payments", label: "Client Payments", icon: CreditCard, color: "text-emerald-600 bg-emerald-100" },
                  ]
                : []),
              ...(canAccessExpenses
                ? [{ href: "/dashboard/expenses", label: "Expenses", icon: Receipt, color: "text-rose-600 bg-rose-100" }]
                : []),
              ...(canAccessFinancialMargins
                ? [
                    { href: "/dashboard/budgets", label: "Budgets & Alerts", icon: PieChart, color: "text-yellow-600 bg-yellow-100" },
                    { href: "/dashboard/profitability", label: "Profitability", icon: TrendingUp, color: "text-emerald-700 bg-emerald-200" },
                  ]
                : []),
            ],
          },
        ]
      : []),

    // 6. Reports & Analytics
    ...(canAccessAnalytics
      ? [
          {
            title: "Analytics",
            items: [
              { href: "/dashboard/analytics", label: "Reports & Analytics", icon: BarChart3, color: "text-violet-600 bg-violet-100" },
            ],
          },
        ]
      : []),

    // 7. Team & Administration
    ...(canAccessUserManagement
      ? [
          {
            title: isAdmin ? "Administration" : "Team & Staff",
            items: [
              { href: "/dashboard/users", label: "User Access", icon: ShieldCheck, color: "text-pink-600 bg-pink-100" },
              ...(isAdmin
                ? [
                    { href: "/dashboard/audit-logs", label: "Audit Logs", icon: History, color: "text-slate-600 bg-slate-100" },
                    { href: "/dashboard/settings", label: "Settings", icon: Settings, color: "text-slate-700 bg-slate-200" },
                  ]
                : []),
            ],
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Top Mobile Bar */}
      <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-xs">
        <WexLogicLogo href="/dashboard" size="sm" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative flex w-full max-w-[300px] flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full shadow-2xl z-10">
            {/* Drawer Header */}
            <div className="flex h-16 items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <WexLogicLogo href="/dashboard" size="sm" />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {sections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <p className="px-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {section.title}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === "/dashboard"
                          ? pathname === "/dashboard"
                          : pathname.startsWith(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-1.5 text-xs font-bold rounded-xl border-2 transition-all ${
                            isActive
                              ? "bg-violet-50 dark:bg-violet-950/60 text-[#1E293B] dark:text-purple-300 border-[#1E293B] dark:border-slate-700 shadow-pop-sm"
                              : "text-slate-600 dark:text-slate-400 border-transparent hover:border-[#1E293B] dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#1E293B] dark:hover:text-slate-200"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center h-6 w-6 rounded-lg border border-[#1E293B] dark:border-slate-700 shrink-0 ${item.color}`}
                          >
                            <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                          </div>
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom User Area */}
            <div className="shrink-0 p-4 border-t-2 border-[#1E293B] dark:border-slate-800 bg-[#FFFDF5] dark:bg-slate-900 space-y-3">
              <div className="p-2.5 bg-white dark:bg-slate-800 border-2 border-[#1E293B] dark:border-slate-700 rounded-2xl shadow-pop-sm">
                <p className="text-xs font-black text-[#1E293B] dark:text-slate-100 truncate">{email}</p>
                {(() => {
                  const roleBadges: Record<string, { bg: string; text: string; border: string; label: string }> = {
                    admin: { bg: "bg-purple-100 dark:bg-purple-950/60", text: "text-purple-900 dark:text-purple-300", border: "border-purple-400 dark:border-purple-800", label: "Admin" },
                    manager: { bg: "bg-sky-100 dark:bg-sky-950/60", text: "text-sky-900 dark:text-sky-300", border: "border-sky-400 dark:border-sky-800", label: "Manager" },
                    sales: { bg: "bg-emerald-100 dark:bg-emerald-950/60", text: "text-emerald-900 dark:text-emerald-300", border: "border-emerald-400 dark:border-emerald-800", label: "Sales" },
                    employee: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-800 dark:text-slate-300", border: "border-slate-300 dark:border-slate-700", label: "Employee" },
                    viewer: { bg: "bg-amber-100 dark:bg-amber-950/60", text: "text-amber-900 dark:text-amber-300", border: "border-amber-300 dark:border-amber-800", label: "Viewer" },
                  };
                  const activeBadge = roleBadges[role || "employee"] || roleBadges.employee;
                  return (
                    <span
                      className={`inline-block mt-0.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${activeBadge.bg} ${activeBadge.text} ${activeBadge.border}`}
                    >
                      {activeBadge.label}
                    </span>
                  );
                })()}
              </div>
              <button
                onClick={async () => {
                  setIsOpen(false);
                  await signOut({ redirectUrl: "/" });
                }}
                className="flex w-full items-center justify-center gap-2 px-3 py-2 text-xs font-black text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-2 border-[#1E293B] dark:border-slate-700 rounded-xl shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" strokeWidth={2.5} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
