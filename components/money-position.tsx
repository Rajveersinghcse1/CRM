import React from "react";
import { formatINR } from "@/utils/finance-calc";
import { ArrowRight, Wallet, ShieldAlert, Sparkles, TrendingUp, Info } from "lucide-react";

interface MoneyPositionProps {
  title?: string;
  subtitle?: string;
  contractValue: number;
  totalCollected: number;
  clientPending: number;
  totalExpenses: number;
  availableBalance: number;
  expectedProfit?: number;
  expectedMarginPct?: number;
  compact?: boolean;
  className?: string;
}

export function MoneyPosition({
  title = "Agency Money Position",
  subtitle = "Independent separation between Client Receivables and Company Project Liquidity",
  contractValue,
  totalCollected,
  clientPending,
  totalExpenses,
  availableBalance,
  expectedProfit,
  expectedMarginPct,
  compact = false,
  className = "",
}: MoneyPositionProps) {
  const collectionRate = contractValue > 0 ? Math.min(100, Math.round((totalCollected / contractValue) * 100)) : 0;
  const spendRate = totalCollected > 0 ? Math.min(100, Math.round((totalExpenses / totalCollected) * 100)) : 0;
  
  const finalProfit = expectedProfit !== undefined ? expectedProfit : contractValue - totalExpenses;
  const finalMargin =
    expectedMarginPct !== undefined
      ? expectedMarginPct
      : contractValue > 0
      ? Math.round(((contractValue - totalExpenses) / contractValue) * 100)
      : 0;

  if (compact) {
    return (
      <div className={`p-3 bg-slate-50/70 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-xl space-y-2 text-xs ${className}`}>
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span>Client Pending: <strong className="text-amber-700 dark:text-amber-400">{formatINR(clientPending)}</strong></span>
          <span>Available: <strong className={availableBalance >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}>{formatINR(availableBalance)}</strong></span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
          <span>Contract: {formatINR(contractValue)}</span>
          <span>Profit: <strong className="text-indigo-600 dark:text-indigo-400">{formatINR(finalProfit)}</strong> ({finalMargin}%)</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              <Wallet className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60">
              Dual-Ledger Flow
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        </div>

        {/* Explain Rule Tooltip Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] text-slate-600 dark:text-slate-300 self-start sm:self-auto">
          <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          <span>Expenses do <strong>not</strong> affect Client Pending</span>
        </div>
      </div>

      {/* The Two Separate Money Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Stream 1: Client Side (Money Still To Collect) */}
        <div className="rounded-xl border border-indigo-100/80 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/20 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                1. Client Side — Inbound Flow
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/60 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md border border-transparent dark:border-indigo-800/60">
              {collectionRate}% Collected
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Agreed deal value vs. funds actually received from client in bank/cash.
          </p>

          {/* Visual Step Pipeline */}
          <div className="grid grid-cols-3 gap-2 items-center bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 shadow-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Contract Agreed</p>
              <p className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">{formatINR(contractValue)}</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 my-0.5" />
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">− Received</p>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{formatINR(totalCollected)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Client Pending</p>
              <p className="text-sm sm:text-base font-black text-amber-700 dark:text-amber-400 mt-0.5">{formatINR(clientPending)}</p>
            </div>
          </div>

          {/* Summary callout */}
          <div className="p-2.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-lg flex items-center justify-between text-xs">
            <span className="text-amber-900 dark:text-amber-300 font-medium">Money client still owes us:</span>
            <span className="font-bold text-amber-900 dark:text-amber-200">{formatINR(clientPending)}</span>
          </div>
        </div>

        {/* Stream 2: Company Side (Money Currently Available) */}
        <div className="rounded-xl border border-emerald-100/80 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/20 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-300">
                2. Company Side — Project Liquidity
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-transparent dark:border-emerald-800/60">
              {spendRate}% Spent
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Real cash received minus project costs spent (Meta ads, shoot, team, models).
          </p>

          {/* Visual Step Pipeline */}
          <div className="grid grid-cols-3 gap-2 items-center bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 shadow-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Total Received</p>
              <p className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">{formatINR(totalCollected)}</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 my-0.5" />
              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400">− Expenses</p>
              <p className="text-xs font-bold text-rose-700 dark:text-rose-300">{formatINR(totalExpenses)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Available Balance</p>
              <p className={`text-sm sm:text-base font-black mt-0.5 ${availableBalance >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>
                {formatINR(availableBalance)}
              </p>
            </div>
          </div>

          {/* Summary callout */}
          <div className={`p-2.5 border rounded-lg flex items-center justify-between text-xs ${
            availableBalance >= 0 
              ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200" 
              : "bg-rose-50/80 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-900/60 text-rose-900 dark:text-rose-200"
          }`}>
            <span className="font-medium">Currently unspent from received cash:</span>
            <span className="font-bold">{formatINR(availableBalance)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Line: Expected Final Project Profit */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-xs">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Expected Final Profit upon full collection</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Formula: Contract Value ({formatINR(contractValue)}) − Total Expenses ({formatINR(totalExpenses)})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Net Profit</span>
            <p className="text-lg font-black text-slate-900 dark:text-slate-100">{formatINR(finalProfit)}</p>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800/80">
            {finalMargin}% Margin
          </span>
        </div>
      </div>
    </div>
  );
}
