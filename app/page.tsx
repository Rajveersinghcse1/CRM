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
    <div className="min-h-screen bg-[#FFFDF5] text-[#1E293B] font-sans selection:bg-amber-300 selection:text-[#1E293B]">
      {/* 1. Sticky Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#FFFDF5]/90 backdrop-blur-md border-b-2 border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <WexLogicLogo href="/" size="md" />

          <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-slate-600">
            <a href="#pillars" className="hover:text-amber-600 transition-colors">
              Pillars
            </a>
            <a href="#features" className="hover:text-amber-600 transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-amber-600 transition-colors">
              Command Center
            </a>
            <a href="#company" className="hover:text-amber-600 transition-colors">
              Company
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {userId ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl btn-gold transition-all flex items-center gap-2"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl btn-gold transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-dot-grid border-b-2 border-[#1E293B]">
        {/* Playful Floating Geometric Badges */}
        <div className="absolute top-12 left-10 hidden xl:block animate-bounce" style={{ animationDuration: "5s" }}>
          <div className="p-3 bg-white border-2 border-[#1E293B] rounded-2xl shadow-pop text-xs font-black flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-400 border border-[#1E293B]" />
            <span>Golden Separation Active</span>
          </div>
        </div>

        <div className="absolute top-28 right-12 hidden xl:block -rotate-6">
          <div className="p-3 bg-amber-100 border-2 border-[#1E293B] rounded-2xl shadow-pop text-xs font-black flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-700" />
            <span>59.0% Realized Margin</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#1E293B] bg-white px-4 py-1 text-xs font-black shadow-pop-sm">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-amber-800 font-extrabold uppercase tracking-widest">
              WexLogic Enterprise Operating System
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1E293B] font-display leading-[1.08]">
            The Intelligent Business CRM &{" "}
            <span className="text-gold-gradient">Financial Cost Engine</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg font-medium text-slate-600 leading-relaxed">
            Built specifically for WexLogic internal operations. Flawlessly separate client contract revenue from internal
            project budgets, monitor vendor expenses, and guarantee healthy profit margins on every engagement.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href={userId ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider btn-gold text-base"
            >
              <span>{userId ? "Access Command Center" : "Sign In to Access"}</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#preview"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider btn-secondary text-base"
            >
              <span>Explore Live System</span>
            </a>
          </div>

          {/* Micro Trust Indicators */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Role-Gated Security
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-violet-600" />
              1-Click Lead to Client Flow
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-amber-600" />
              Decimal-Accurate INR Math
            </span>
          </div>
        </div>
      </section>

      {/* 3. Live Command Center Preview Showcase */}
      <section id="preview" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <p className="text-xs font-black uppercase tracking-wider text-amber-700">
            Real-Time Operational Pulse
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] font-display">
            Interactive Command Center
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Experience complete clarity across all sales pipelines, active engagements, and vendor disbursements.
          </p>
        </div>

        {/* Mock Browser Container */}
        <div className="bg-white rounded-3xl border-2 border-[#1E293B] shadow-pop-xl overflow-hidden">
          {/* Top Window Chrome */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#1E293B] bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-rose-400 border border-[#1E293B]" />
              <span className="h-3.5 w-3.5 rounded-full bg-amber-400 border border-[#1E293B]" />
              <span className="h-3.5 w-3.5 rounded-full bg-emerald-400 border border-[#1E293B]" />
            </div>
            <div className="px-4 py-1 rounded-full bg-white border border-[#1E293B] text-[11px] font-mono text-slate-500 font-bold">
              https://crm.wexlogic.com/dashboard
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase text-slate-600">Production Ready</span>
            </div>
          </div>

          {/* Interactive UI Mock Inside Window */}
          <div className="p-6 md:p-8 bg-[#FFFDF5] space-y-6">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border-2 border-[#1E293B] bg-white shadow-pop-sm">
                <p className="text-[10px] font-black uppercase text-slate-500">Total Pipeline Value</p>
                <p className="text-xl md:text-2xl font-black text-[#1E293B] mt-1">₹5,00,000</p>
                <p className="text-[10px] font-bold text-purple-600 mt-1">1 Active Project</p>
              </div>

              <div className="p-4 rounded-xl border-2 border-[#1E293B] bg-white shadow-pop-sm">
                <p className="text-[10px] font-black uppercase text-slate-500">Collected Revenue</p>
                <p className="text-xl md:text-2xl font-black text-emerald-700 mt-1">₹3,50,000</p>
                <p className="text-[10px] font-bold text-emerald-600 mt-1">70% Realized Cash</p>
              </div>

              <div className="p-4 rounded-xl border-2 border-[#1E293B] bg-white shadow-pop-sm">
                <p className="text-[10px] font-black uppercase text-slate-500">Total Actual Costs</p>
                <p className="text-xl md:text-2xl font-black text-rose-700 mt-1">₹2,05,000</p>
                <p className="text-[10px] font-bold text-rose-600 mt-1">Vendor & Direct Outflows</p>
              </div>

              <div className="p-4 rounded-xl border-2 border-[#1E293B] bg-white shadow-pop-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase text-slate-500">Net Gross Profit</p>
                  <span className="px-1.5 py-0.2 rounded font-black text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                    59.0%
                  </span>
                </div>
                <p className="text-xl md:text-2xl font-black text-[#1E293B] mt-1">₹2,95,000</p>
                <p className="text-[10px] font-bold text-slate-500 mt-1">Receivables: ₹1,50,000</p>
              </div>
            </div>

            {/* Budget Alert Preview Banner */}
            <div className="p-4 rounded-xl border-2 border-rose-400 bg-rose-50 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-pop-sm">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-rose-200 border border-rose-500 text-rose-800">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-rose-950">
                    Active Budget Alert: ABC Events - Garba Event 2026
                  </p>
                  <p className="text-[11px] font-medium text-rose-700">
                    Category <span className="font-bold">Decoration</span> has reached 90% utilization (₹45,000 of ₹50,000 spent).
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/budgets"
                className="px-3 py-1.5 rounded-lg border border-rose-500 bg-white text-xs font-black text-rose-900 hover:bg-rose-100 self-start md:self-auto transition-all"
              >
                Inspect Category &rarr;
              </Link>
            </div>

            {/* Bottom Preview Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border-2 border-[#1E293B] bg-white shadow-pop-sm space-y-2">
                <span className="text-xs font-black text-[#1E293B] block">Client Engagement Hub</span>
                <p className="text-xs text-slate-500">
                  Complete 360° workspace for ABC Events: 4 cost categories, linked tasks, and invoice history.
                </p>
              </div>
              <div className="p-4 rounded-xl border-2 border-[#1E293B] bg-white shadow-pop-sm space-y-2">
                <span className="text-xs font-black text-[#1E293B] block">Unified Chronological Calendar</span>
                <p className="text-xs text-slate-500">
                  Deadlines, client milestones, invoice due dates, and vendor payments mapped on a single month view.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The 4 Golden Pillars of WexLogic Architecture */}
      <section id="pillars" className="py-16 md:py-24 bg-white border-t-2 border-b-2 border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <p className="text-xs font-black uppercase tracking-wider text-amber-700">
              Core Architecture
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] font-display">
              The 4 Architectural Pillars
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              How WexLogic CRM prevents the classic pitfalls of generic project tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl border-2 border-[#1E293B] bg-[#FFFDF5] shadow-pop space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 border-2 border-[#1E293B] flex items-center justify-center text-amber-700 shadow-pop-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-[#1E293B]">1. The Golden Separation</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Client payments credit Collected Revenue only. They are never blindly auto-allocated to internal cost categories. Internal expenses are logged against specific cost budgets to calculate genuine gross profit.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl border-2 border-[#1E293B] bg-[#FFFDF5] shadow-pop space-y-3">
              <div className="h-10 w-10 rounded-xl bg-violet-100 border-2 border-[#1E293B] flex items-center justify-center text-violet-700 shadow-pop-sm">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-[#1E293B]">2. Fast Hierarchical Budgeting</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                No painful multi-level dropdowns. Logging an expense takes 3 seconds with project and category selectors. Subcategories remain strictly optional for deep tracking without slowing team execution.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl border-2 border-[#1E293B] bg-[#FFFDF5] shadow-pop space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 border-2 border-[#1E293B] flex items-center justify-center text-emerald-700 shadow-pop-sm">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-[#1E293B]">3. Real-Time Gross Margins</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Live mathematical computation: Gross Profit = Contract Value - Actual Costs. Instant Gross Margin % calculation with healthy, warning, and over-budget badges visible across all project workspaces.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-2xl border-2 border-[#1E293B] bg-[#FFFDF5] shadow-pop space-y-3">
              <div className="h-10 w-10 rounded-xl bg-sky-100 border-2 border-[#1E293B] flex items-center justify-center text-sky-700 shadow-pop-sm">
                <FolderKanban className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-[#1E293B]">4. Client & Project 360° Workspace</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                A single hub containing Category Budgets, Vendor Bills, Invoices, Client Payments, and Operational Tasks. Every stakeholder sees identical, synchronized financial numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Complete Feature Matrix */}
      <section id="features" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-amber-700">
            Full Operations Suite
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] font-display">
            Built for Every Business Department
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            From initial sales outreach to project closeout and financial audits.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Leads & Conversion */}
          <div className="p-6 rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop space-y-3 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-sky-100 border-2 border-[#1E293B] w-fit text-sky-700 shadow-pop-sm">
              <Users className="h-5 w-5" />
            </div>
            <h4 className="text-base font-black text-[#1E293B]">Leads & 1-Click Conversion</h4>
            <p className="text-xs text-slate-600 font-medium">
              Capture prospective engagements and convert qualified leads into active clients with a single click, preserving all historical context.
            </p>
          </div>

          {/* Card 2: Deals Kanban */}
          <div className="p-6 rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop space-y-3 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-amber-100 border-2 border-[#1E293B] w-fit text-amber-700 shadow-pop-sm">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h4 className="text-base font-black text-[#1E293B]">6-Stage Deals Kanban</h4>
            <p className="text-xs text-slate-600 font-medium">
              Visual pipeline tracking from New to Won. Monitor pipeline totals and probability-weighted values at a glance.
            </p>
          </div>

          {/* Card 3: Invoicing & AR */}
          <div className="p-6 rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop space-y-3 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-blue-100 border-2 border-[#1E293B] w-fit text-blue-700 shadow-pop-sm">
              <CreditCard className="h-5 w-5" />
            </div>
            <h4 className="text-base font-black text-[#1E293B]">Invoices & Client Payments</h4>
            <p className="text-xs text-slate-600 font-medium">
              Issue client invoices with custom prefixes and log multi-part cash collections. Always know your outstanding receivables.
            </p>
          </div>

          {/* Card 4: Vendor Bills & AP */}
          <div className="p-6 rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop space-y-3 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-rose-100 border-2 border-[#1E293B] w-fit text-rose-700 shadow-pop-sm">
              <Receipt className="h-5 w-5" />
            </div>
            <h4 className="text-base font-black text-[#1E293B]">Vendor Bills & Expenses</h4>
            <p className="text-xs text-slate-600 font-medium">
              Manage accounts payable by linking bills directly to project categories (Meta Ads, Decoration, Modeling, Video).
            </p>
          </div>

          {/* Card 5: Unified Calendar */}
          <div className="p-6 rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop space-y-3 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-indigo-100 border-2 border-[#1E293B] w-fit text-indigo-700 shadow-pop-sm">
              <Calendar className="h-5 w-5" />
            </div>
            <h4 className="text-base font-black text-[#1E293B]">Unified Deadlines Calendar</h4>
            <p className="text-xs text-slate-600 font-medium">
              Cross-system schedule coordinating project milestones, urgent task deliverables, and financial payment due dates.
            </p>
          </div>

          {/* Card 6: Audit & Compliance */}
          <div className="p-6 rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop space-y-3 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            <div className="p-2.5 rounded-xl bg-purple-100 border-2 border-[#1E293B] w-fit text-purple-700 shadow-pop-sm">
              <Lock className="h-5 w-5" />
            </div>
            <h4 className="text-base font-black text-[#1E293B]">Admin Audit Logs</h4>
            <p className="text-xs text-slate-600 font-medium">
              Immutable logging of every record creation, status change, and financial deletion for full enterprise compliance.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Company & Corporate Trust Section */}
      <section id="company" className="py-16 md:py-20 bg-slate-900 text-white border-t-2 border-[#1E293B]">
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

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            <a
              href="https://www.wexlogic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white bg-white text-[#1E293B] text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all shadow-pop-sm"
            >
              <span>Visit Official Website</span>
              <ChevronRight className="h-4 w-4" />
            </a>
            <Link
              href={userId ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-gold text-xs font-black uppercase tracking-wider"
            >
              <span>{userId ? "Enter Internal Portal" : "Sign In to Portal"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-white border-t-2 border-[#1E293B] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <WexLogicLogo href="/" size="sm" />
            <span className="text-xs font-bold text-slate-500">
              &copy; {new Date().getFullYear()} WexLogic. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-black uppercase tracking-wider text-slate-600">
            <Link href={userId ? "/dashboard" : "/login"} className="hover:text-amber-600">
              Dashboard
            </Link>
            <Link href={userId ? "/dashboard/projects" : "/login"} className="hover:text-amber-600">
              Projects
            </Link>
            <Link href={userId ? "/dashboard/calendar" : "/login"} className="hover:text-amber-600">
              Calendar
            </Link>
            <Link href={userId ? "/dashboard" : "/login"} className="hover:text-amber-600">
              {userId ? "Dashboard" : "Admin Login"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
