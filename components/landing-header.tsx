"use client";

import { useState } from "react";
import Link from "next/link";
import { WexLogicLogo } from "@/components/wexlogic-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X, ArrowRight, LayoutDashboard, LogIn, Shield, Sparkles, Building2, Layers } from "lucide-react";

export function LandingHeader({ userId }: { userId: string | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#pillars", label: "Pillars", icon: Shield },
    { href: "#features", label: "Features", icon: Layers },
    { href: "#preview", label: "Command Center", icon: Sparkles },
    { href: "#company", label: "Company", icon: Building2 },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#FFFDF5]/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-b-2 border-[#1E293B] dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <WexLogicLogo href="/" size="md" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {userId ? (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl btn-gold shadow-pop-sm transition-all"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl btn-gold shadow-pop-sm transition-all"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1E293B] dark:text-slate-100 shadow-pop-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center shrink-0"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-[#1E293B] dark:text-slate-100" strokeWidth={2.5} />
              ) : (
                <Menu className="h-6 w-6 text-[#1E293B] dark:text-slate-100" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-full max-w-[320px] flex-col bg-[#FFFDF5] dark:bg-[#0F172A] border-r-2 border-[#1E293B] dark:border-slate-800 h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="flex h-20 items-center justify-between p-4 border-b-2 border-[#1E293B] dark:border-slate-800 bg-[#FFFDF5] dark:bg-[#0B0F19] shrink-0">
              <WexLogicLogo href="/" size="sm" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl border-2 border-[#1E293B] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1E293B] dark:text-slate-100 cursor-pointer shadow-pop-sm"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-2">
                Navigation
              </p>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-amber-50 dark:hover:bg-slate-800 text-[#1E293B] dark:text-slate-100 text-xs font-black shadow-pop-sm transition-all"
                  >
                    <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="p-5 border-t-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-[#0B0F19] space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Theme</span>
                <ThemeToggle showLabel />
              </div>

              {userId ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl btn-gold text-xs font-black uppercase tracking-wider shadow-pop-sm"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Open Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl btn-gold text-xs font-black uppercase tracking-wider shadow-pop-sm"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In to Portal</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
