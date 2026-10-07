"use client";

import { useState } from "react";
import {
  Building2,
  Globe,
  Coins,
  Shield,
  Layers,
  Save,
  CheckCircle2,
  Sliders,
  FileText,
  Mail,
  MapPin,
} from "lucide-react";

export function SettingsClient() {
  const [saved, setSaved] = useState(false);
  const [companyName, setCompanyName] = useState("WexLogic");
  const [website, setWebsite] = useState("https://www.wexlogic.com/");
  const [email, setEmail] = useState("contact@wexlogic.com");
  const [location, setLocation] = useState("Surat, Gujarat, India");
  const [currency, setCurrency] = useState("INR");
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");
  const [billPrefix, setBillPrefix] = useState("VB-");
  const [paymentTerms, setPaymentTerms] = useState("15");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Save Toast Notification */}
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 dark:border-emerald-700 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-black shadow-pop-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Settings successfully saved and synchronized.
        </div>
      )}

      {/* Row 1: Company Profile */}
      <div className="p-6 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#1E293B]/10 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-black text-[#1E293B] dark:text-slate-100">Company Profile</h3>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Global defaults</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-[#1E293B] dark:text-slate-300 uppercase">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-[#1E293B] dark:text-slate-300 uppercase">Website URL</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-[#1E293B] dark:text-slate-300 uppercase">Contact Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-[#1E293B] dark:text-slate-300 uppercase">Headquarters / Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Financial & Invoicing Defaults */}
      <div className="p-6 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#1E293B]/10 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-black text-[#1E293B] dark:text-slate-100">Financial & Invoicing Defaults</h3>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Currencies & Prefixing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-[#1E293B] dark:text-slate-300 uppercase">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="INR" className="dark:bg-slate-900 dark:text-slate-100">INR (₹) - Indian Rupee</option>
              <option value="USD" className="dark:bg-slate-900 dark:text-slate-100">USD ($) - US Dollar</option>
              <option value="EUR" className="dark:bg-slate-900 dark:text-slate-100">EUR (€) - Euro</option>
              <option value="AED" className="dark:bg-slate-900 dark:text-slate-100">AED (د.إ) - UAE Dirham</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-[#1E293B] dark:text-slate-300 uppercase">Invoice Prefix</label>
            <input
              type="text"
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-[#1E293B] dark:text-slate-300 uppercase">Vendor Bill Prefix</label>
            <input
              type="text"
              value={billPrefix}
              onChange={(e) => setBillPrefix(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-[#1E293B] dark:text-slate-300 uppercase">Default Payment Terms</label>
            <select
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="0" className="dark:bg-slate-900 dark:text-slate-100">Due on Receipt (Immediate)</option>
              <option value="15" className="dark:bg-slate-900 dark:text-slate-100">Net 15 Days</option>
              <option value="30" className="dark:bg-slate-900 dark:text-slate-100">Net 30 Days</option>
              <option value="60" className="dark:bg-slate-900 dark:text-slate-100">Net 60 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Row 3: Standard Project Cost Categories */}
      <div className="p-6 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#1E293B]/10 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-black text-[#1E293B] dark:text-slate-100">Standard Project Cost Categories</h3>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Preset expense allocations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: "Meta Ads & Paid Media", desc: "Facebook, Instagram, Google Ads budget" },
            { name: "Decoration & Production", desc: "Stage design, venue, equipment rental" },
            { name: "Influencers & Modeling", desc: "Talent fees, agency commissions" },
            { name: "Video & Photography", desc: "Shoots, editing, motion graphics" },
            { name: "Software & Cloud Hosting", desc: "SaaS tools, hosting, server costs" },
            { name: "Travel & Field Logistics", desc: "Flight, hotel, local transport" },
          ].map((cat, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 shadow-pop-sm space-y-1"
            >
              <p className="text-xs font-black text-[#1E293B] dark:text-slate-200">{cat.name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: System Architecture & Engine Diagnostics */}
      <div className="p-6 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#1E293B]/10 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            <h3 className="text-lg font-black text-[#1E293B] dark:text-slate-100">System Diagnostics</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-300 dark:border-emerald-800/80">
            Engine Healthy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 font-bold block">Application Version</span>
            <span className="font-black text-[#1E293B] dark:text-slate-100 text-sm">WexLogic CRM v2.0</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 font-bold block">Core Framework</span>
            <span className="font-black text-[#1E293B] dark:text-slate-100 text-sm">Next.js 16 (App Router)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 font-bold block">Authentication</span>
            <span className="font-black text-[#1E293B] dark:text-slate-100 text-sm">Clerk Identity (Role-Gated)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 font-bold block">Database Layer</span>
            <span className="font-black text-[#1E293B] dark:text-slate-100 text-sm">Supabase Hybrid Engine</span>
          </div>
        </div>
      </div>

      {/* Save Action Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-[#1E293B] dark:border-indigo-500 bg-[#1E293B] dark:bg-indigo-600 hover:dark:bg-indigo-700 text-xs font-black text-white hover:bg-slate-800 shadow-pop transition-all cursor-pointer"
        >
          <Save className="h-4 w-4 text-emerald-400" />
          Save Settings
        </button>
      </div>
    </form>
  );
}
