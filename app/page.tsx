import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FolderKanban,
  CreditCard,
  Receipt,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  BarChart3,
  Building2,
  AlertTriangle,
  Lock,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { WexLogicLogo } from "@/components/wexlogic-logo";
import { LandingHeader } from "@/components/landing-header";

export const metadata = {
  title: "WexLogic CRM — Business OS, Project Management & Financial Cost Tracking",
  description:
    "Internal enterprise operations platform for WexLogic. Unified client relations, project cost tracking, and real-time gross profit margins.",
};

export default async function HomePage() {
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session?.userId || null;
  } catch (err: unknown) {
    const error = err as { digest?: string };
    if (error?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.warn("HomePage auth check fallback:", err);
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] dark:bg-[#0B0F19] text-[#1E293B] dark:text-slate-100 font-sans selection:bg-amber-300 selection:text-[#1E293B] transition-colors">
      {/* 1. Sticky Navigation Header with Mobile Drawer & Theme Toggle */}
      <LandingHeader userId={userId} />

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-dot-grid bg-[#FFFDF5] dark:bg-[#0B0F19] border-b-2 border-[#1E293B] dark:border-slate-800">
        {/* Soft Contrast Shield - Prevents background dots from submerging text in dark mode */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF5]/60 via-[#FFFDF5]/85 to-[#FFFDF5] dark:from-[#0B0F19]/75 dark:via-[#0B0F19]/90 dark:to-[#0B0F19] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#FFFDF5_90%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_20%,#0B0F19_90%)] pointer-events-none opacity-70" />

        {/* Playful Floating Geometric Badges */}
        <div className="absolute top-12 left-10 hidden xl:block animate-bounce" style={{ animationDuration: "5s" }}>
          <div className="p-3 bg-white dark:bg-slate-900 border-2 border-[#1E293B] dark:border-slate-700 rounded-2xl shadow-pop text-xs font-black flex items-center gap-2 text-[#1E293B] dark:text-slate-100">
            <div className="h-3 w-3 rounded-full bg-emerald-400 border border-[#1E293B] dark:border-slate-700" />
            <span>Golden Separation Active</span>
          </div>
        </div>

        <div className="absolute top-28 right-12 hidden xl:block -rotate-6">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/60 border-2 border-[#1E293B] dark:border-slate-700 rounded-2xl shadow-pop text-xs font-black flex items-center gap-2 text-amber-950 dark:text-amber-300">
            <TrendingUp className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            <span>59.0% Realized Margin</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#1E293B] dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-1 text-xs font-black shadow-pop-sm">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-amber-800 dark:text-amber-400 font-extrabold uppercase tracking-widest text-[11px] sm:text-xs">
              WexLogic Enterprise Operating System
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1E293B] dark:text-slate-100 font-display leading-[1.1] sm:leading-[1.08]">
            The Intelligent Business CRM &{" "}
            <span className="text-gold-gradient">Financial Cost Engine</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-sm sm:text-base md:text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
            Built specifically for WexLogic internal operations. Flawlessly separate client contract revenue from internal
            project budgets, monitor vendor expenses, and guarantee healthy profit margins on every engagement.
          </p>

          {/* Call to Actions - Stack on mobile screens */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-4 max-w-md sm:max-w-none mx-auto">
            <Link
              href={userId ? "/dashboard" : "/login"}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider btn-gold shadow-pop-sm"
            >
              <span>{userId ? "Access Command Center" : "Sign In to Access"}</span>
              <ArrowRight className="h-4 sm:h-5 w-4 sm:w-5" />
            </Link>
            <a
              href="#preview"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider border-2 border-[#1E293B] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1E293B] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-pop-sm transition-all"
            >
              <span>Explore Live System</span>
            </a>
          </div>

          {/* Micro Trust Indicators */}
          <div className="pt-6 sm:pt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Role-Gated Security
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              1-Click Lead to Client Flow
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Decimal-Accurate INR Math
            </span>
          </div>
        </div>
      </section>

      {/* 3. Live Command Center Preview Showcase */}
      <section id="preview" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <p className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Real-Time Operational Pulse
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] dark:text-slate-100 font-display">
            Interactive Command Center
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Experience complete clarity across all sales pipelines, active engagements, and vendor disbursements.
          </p>
        </div>

        {/* Mock Browser Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#1E293B] dark:border-slate-800 shadow-pop-xl overflow-hidden">
          {/* Top Window Chrome */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#1E293B] dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-rose-400 border border-[#1E293B] dark:border-slate-700" />
              <span className="h-3.5 w-3.5 rounded-full bg-amber-400 border border-[#1E293B] dark:border-slate-700" />
              <span className="h-3.5 w-3.5 rounded-full bg-emerald-400 border border-[#1E293B] dark:border-slate-700" />
            </div>
            <div className="px-3 sm:px-4 py-1 rounded-full bg-white dark:bg-slate-900 border border-[#1E293B] dark:border-slate-700 text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold truncate max-w-[180px] sm:max-w-none">
              https://crm.wexlogic.com/dashboard
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 hidden sm:inline">Production Ready</span>
            </div>
          </div>

          {/* Interactive UI Mock Inside Window */}
          <div className="p-4 sm:p-6 md:p-8 bg-[#FFFDF5] dark:bg-[#0B0F19] space-y-6">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop-sm">
                <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Total Pipeline Value</p>
                <p className="text-xl md:text-2xl font-black text-[#1E293B] dark:text-slate-100 mt-1">₹5,00,000</p>
                <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mt-1">1 Active Project</p>
              </div>

              <div className="p-4 rounded-xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop-sm">
                <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Collected Revenue</p>
                <p className="text-xl md:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">₹3,50,000</p>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">70% Realized Cash</p>
              </div>

              <div className="p-4 rounded-xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop-sm">
                <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Total Actual Costs</p>
                <p className="text-xl md:text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">₹2,05,000</p>
                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1">Vendor & Direct Outflows</p>
              </div>

              <div className="p-4 rounded-xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Net Gross Profit</p>
                  <span className="px-1.5 py-0.2 rounded font-black text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    59.0%
                  </span>
                </div>
                <p className="text-xl md:text-2xl font-black text-[#1E293B] dark:text-slate-100 mt-1">₹2,95,000</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">Receivables: ₹1,50,000</p>
              </div>
            </div>

            {/* Budget Alert Preview Banner */}
            <div className="p-4 rounded-xl border-2 border-rose-400 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-pop-sm">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-rose-200 dark:bg-rose-900/60 border border-rose-500 dark:border-rose-700 text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-rose-950 dark:text-rose-200">
                    Active Budget Alert: ABC Events - Garba Event 2026
                  </p>
                  <p className="text-[11px] font-medium text-rose-700 dark:text-rose-300">
                    Category <span className="font-bold">Decoration</span> has reached 90% utilization (₹45,000 of ₹50,000 spent).
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg border border-rose-500 dark:border-rose-700 bg-white dark:bg-slate-900 text-xs font-black text-rose-900 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/50 self-start md:self-auto transition-all"
              >
                Inspect Category &rarr;
              </Link>
            </div>

            {/* Bottom Preview Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop-sm space-y-2">
                <span className="text-xs font-black text-[#1E293B] dark:text-slate-100 block">Client Engagement Hub</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Complete 360° workspace for ABC Events: 4 cost categories, linked tasks, and invoice history.
                </p>
              </div>
              <div className="p-4 rounded-xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop-sm space-y-2">
                <span className="text-xs font-black text-[#1E293B] dark:text-slate-100 block">Unified Chronological Calendar</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Deadlines, client milestones, invoice due dates, and vendor payments mapped on a single month view.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The 4 Golden Pillars of WexLogic Architecture */}
      <section id="pillars" className="py-16 md:py-24 bg-white dark:bg-slate-950 border-t-2 border-b-2 border-[#1E293B] dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <p className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Core Architecture
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] dark:text-slate-100 font-display">
              The 4 Architectural Pillars
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              How WexLogic CRM prevents the classic pitfalls of generic project tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-[#FFFDF5] dark:bg-slate-900 shadow-pop space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 border-2 border-[#1E293B] dark:border-slate-700 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-pop-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-[#1E293B] dark:text-slate-100">1. The Golden Separation</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Client payments credit Collected Revenue only. They are never blindly auto-allocated to internal cost categories. Internal expenses are logged against specific cost budgets to calculate genuine gross profit.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-[#FFFDF5] dark:bg-slate-900 shadow-pop space-y-3">
              <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 border-2 border-[#1E293B] dark:border-slate-700 flex items-center justify-center text-violet-700 dark:text-violet-400 shadow-pop-sm">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-[#1E293B] dark:text-slate-100">2. Fast Hierarchical Budgeting</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                No painful multi-level dropdowns. Logging an expense takes 3 seconds with project and category selectors. Subcategories remain strictly optional for deep tracking without slowing team execution.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-[#FFFDF5] dark:bg-slate-900 shadow-pop space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border-2 border-[#1E293B] dark:border-slate-700 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-pop-sm">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-[#1E293B] dark:text-slate-100">3. Real-Time Gross Margins</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Live mathematical computation: Gross Profit = Contract Value - Actual Costs. Instant Gross Margin % calculation with healthy, warning, and over-budget badges visible across all project workspaces.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-[#FFFDF5] dark:bg-slate-900 shadow-pop space-y-3">
              <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 border-2 border-[#1E293B] dark:border-slate-700 flex items-center justify-center text-sky-700 dark:text-sky-400 shadow-pop-sm">
                <FolderKanban className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-[#1E293B] dark:text-slate-100">4. Client & Project 360° Workspace</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                A single hub containing Category Budgets, Vendor Bills, Invoices, Client Payments, and Operational Tasks. Every stakeholder sees identical, synchronized financial numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Complete Feature Matrix */}
      <section id="features" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Full Operations Suite
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] dark:text-slate-100 font-display">
            Built for Every Business Department
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            From initial sales outreach to project closeout and financial audits.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Leads & Conversion */}
          <div className="p-6 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop space-y-3 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-950/60 border-2 border-[#1E293B] dark:border-slate-700 w-fit text-sky-700 dark:text-sky-400 shadow-pop-sm">
              <Users className="h-5 w-5" />
            </div>
            <h4 className="text-base font-black text-[#1E293B] dark:text-slate-100">Leads & 1-Click Conversion</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Capture prospective engagements and convert qualified leads into active clients with a single click, preserving all historical context.
            </p>
          </div>

          {/* Card 2: Deals Kanban */}
          <div className="p-6 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop space-y-3 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 border-2 border-[#1E293B] dark:border-slate-700 w-fit text-amber-700 dark:text-amber-400 shadow-pop-sm">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h4 className="text-base font-black text-[#1E293B] dark:text-slate-100">6-Stage Deals Kanban</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Visual pipeline tracking from New to Won. Monitor pipeline totals and probability-weighted values at a glance.
            </p>
          </div>

          {/* Card 3: Invoicing & AR */}
          <div className="p-6 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop space-y-3 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 border-2 border-[#1E293B] dark:border-slate-700 w-fit text-blue-700 dark:text-blue-400 shadow-pop-sm">
              <CreditCard className="h-5 w-5" />
            </div>
            <h4 className="text-base font-black text-[#1E293B] dark:text-slate-100">Invoices & Client Payments</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Issue client invoices with custom prefixes and log multi-part cash collections. Always know your outstanding receivables.
            </p>
          </div>

          {/* Card 4: Vendor Bills & AP */}
          <div className="p-6 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop space-y-3 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 border-2 border-[#1E293B] dark:border-slate-700 w-fit text-rose-700 dark:text-rose-400 shadow-pop-sm">
              <Receipt className="h-5 w-5" />
            </div>
            <h4 className="text-base font-black text-[#1E293B] dark:text-slate-100">Vendor Bills & Expenses</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Manage accounts payable by linking bills directly to project categories (Meta Ads, Decoration, Modeling, Video).
            </p>
          </div>

          {/* Card 5: Unified Calendar */}
          <div className="p-6 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop space-y-3 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 border-2 border-[#1E293B] dark:border-slate-700 w-fit text-indigo-700 dark:text-indigo-400 shadow-pop-sm">
              <Calendar className="h-5 w-5" />
            </div>
            <h4 className="text-base font-black text-[#1E293B] dark:text-slate-100">Unified Deadlines Calendar</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Cross-system schedule coordinating project milestones, urgent task deliverables, and financial payment due dates.
            </p>
          </div>

          {/* Card 6: Audit & Compliance */}
          <div className="p-6 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop space-y-3 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 border-2 border-[#1E293B] dark:border-slate-700 w-fit text-purple-700 dark:text-purple-400 shadow-pop-sm">
              <Lock className="h-5 w-5" />
            </div>
            <h4 className="text-base font-black text-[#1E293B] dark:text-slate-100">Admin Audit Logs</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Immutable logging of every record creation, status change, and financial deletion for full enterprise compliance.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Company & Corporate Trust Section */}
      <section id="company" className="py-16 md:py-20 bg-slate-900 dark:bg-slate-950 text-white border-t-2 border-[#1E293B] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 text-xs font-bold">
            <Building2 className="h-3.5 w-3.5" />
            <span>WexLogic Company Operations</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black font-display text-white">
            Engineered for WexLogic Excellence
          </h2>

          <p className="max-w-2xl mx-auto text-sm text-slate-300 leading-relaxed font-medium">
            WexLogic is committed to delivering world-class digital innovation and event experiences.
            This proprietary system powers our internal project logistics, financial discipline, and client transparency.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4">
            <a
              href="https://www.wexlogic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white dark:border-slate-700 bg-white dark:bg-slate-900 text-[#1E293B] dark:text-slate-100 text-xs font-black uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-pop-sm"
            >
              <span>Visit Official Website</span>
              <ChevronRight className="h-4 w-4" />
            </a>
            <Link
              href={userId ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-gold text-xs font-black uppercase tracking-wider shadow-pop-sm"
            >
              <span>{userId ? "Enter Internal Portal" : "Sign In to Portal"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-white dark:bg-[#0B0F19] border-t-2 border-[#1E293B] dark:border-slate-800 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <WexLogicLogo href="/" size="sm" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              &copy; {new Date().getFullYear()} WexLogic. All rights reserved.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <Link href={userId ? "/dashboard" : "/login"} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              Dashboard
            </Link>
            <Link href={userId ? "/dashboard/projects" : "/login"} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              Projects
            </Link>
            <Link href={userId ? "/dashboard/calendar" : "/login"} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              Calendar
            </Link>
            <Link href={userId ? "/dashboard" : "/login"} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              {userId ? "Command Center" : "Admin Login"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

