"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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

type Props = {
  role?: string | null;
};

export function SidebarNav({ role }: Props) {
  const pathname = usePathname();

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
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          iconColor: "text-violet-600 bg-violet-100",
        },
      ],
    },

    // 2. Sales & Client Acquisition (Leads -> Pipeline Deals -> Clients -> Companies)
    ...(canAccessSales
      ? [
          {
            title: "Sales & Pipeline",
            items: [
              {
                href: "/dashboard/leads",
                label: "Leads",
                icon: UserPlus,
                iconColor: "text-sky-600 bg-sky-100",
              },
              {
                href: "/dashboard/deals",
                label: "Deals Pipeline",
                icon: GitPullRequest,
                iconColor: "text-amber-600 bg-amber-100",
              },
              {
                href: "/dashboard/clients",
                label: "Clients",
                icon: Users,
                iconColor: "text-emerald-600 bg-emerald-100",
              },
              {
                href: "/dashboard/companies",
                label: "Companies",
                icon: Building2,
                iconColor: "text-indigo-600 bg-indigo-100",
              },
            ],
          },
        ]
      : []),

    // 3. Projects & Operations (Projects -> Categories -> Tasks -> Calendar -> Activities)
    {
      title: "Projects & Operations",
      items: [
        {
          href: "/dashboard/projects",
          label: "Projects Hub",
          icon: FolderKanban,
          iconColor: "text-purple-600 bg-purple-100",
        },
        ...(canAccessCategories
          ? [
              {
                href: "/dashboard/categories",
                label: "Categories",
                icon: Tags,
                iconColor: "text-teal-600 bg-teal-100",
              },
            ]
          : []),
        ...(canAccessTasks
          ? [
              {
                href: "/dashboard/tasks",
                label: "Tasks",
                icon: CheckSquare,
                iconColor: "text-blue-600 bg-blue-100",
              },
            ]
          : []),
        {
          href: "/dashboard/calendar",
          label: "Calendar",
          icon: Calendar,
          iconColor: "text-indigo-600 bg-indigo-100",
        },
        ...(canAccessActivities
          ? [
              {
                href: "/dashboard/activities",
                label: "Activities",
                icon: Activity,
                iconColor: "text-pink-600 bg-pink-100",
              },
            ]
          : []),
      ],
    },

    // 4. Vendors & Procurement (Vendors -> Vendor Bills)
    ...(canAccessVendors
      ? [
          {
            title: "Vendors & Procurement",
            items: [
              {
                href: "/dashboard/vendors",
                label: "Vendors",
                icon: Truck,
                iconColor: "text-amber-700 bg-amber-100",
              },
              {
                href: "/dashboard/vendor-bills",
                label: "Vendor Bills",
                icon: FileSpreadsheet,
                iconColor: "text-orange-600 bg-orange-100",
              },
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
                    {
                      href: "/dashboard/invoices",
                      label: "Invoices",
                      icon: FileText,
                      iconColor: "text-blue-600 bg-blue-100",
                    },
                    {
                      href: "/dashboard/payments",
                      label: "Client Payments",
                      icon: CreditCard,
                      iconColor: "text-emerald-600 bg-emerald-100",
                    },
                  ]
                : []),
              ...(canAccessExpenses
                ? [
                    {
                      href: "/dashboard/expenses",
                      label: "Expenses",
                      icon: Receipt,
                      iconColor: "text-rose-600 bg-rose-100",
                    },
                  ]
                : []),
              ...(canAccessFinancialMargins
                ? [
                    {
                      href: "/dashboard/budgets",
                      label: "Budgets & Alerts",
                      icon: PieChart,
                      iconColor: "text-yellow-600 bg-yellow-100",
                    },
                    {
                      href: "/dashboard/profitability",
                      label: "Profitability",
                      icon: TrendingUp,
                      iconColor: "text-emerald-700 bg-emerald-200",
                    },
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
              {
                href: "/dashboard/analytics",
                label: "Reports & Analytics",
                icon: BarChart3,
                iconColor: "text-violet-600 bg-violet-100",
              },
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
              {
                href: "/dashboard/users",
                label: "User Access",
                icon: ShieldCheck,
                iconColor: "text-pink-600 bg-pink-100",
              },
              ...(isAdmin
                ? [
                    {
                      href: "/dashboard/audit-logs",
                      label: "Audit Logs",
                      icon: History,
                      iconColor: "text-slate-600 bg-slate-100",
                    },
                    {
                      href: "/dashboard/settings",
                      label: "Settings",
                      icon: Settings,
                      iconColor: "text-slate-700 bg-slate-200",
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
  ];

  return (
    <nav className="space-y-4 pb-8">
      {sections.map((section) => (
        <div key={section.title} className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {section.title}
          </p>
          <div className="space-y-0.5">
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
                  className={`flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-bold shadow-xs"
                      : "text-slate-600 font-medium hover:bg-slate-100/70 hover:text-slate-900"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center h-6 w-6 rounded-md shrink-0 ${
                      isActive ? "bg-indigo-600 text-white shadow-xs" : item.iconColor
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
