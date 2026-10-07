"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckSquare,
  FileText,
  FileSpreadsheet,
  FolderKanban,
  Activity as ActivityIcon,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import type { Task, Invoice, VendorBill, Project, Activity } from "@/types/crm";

interface CalendarEvent {
  id: string;
  type: "task" | "invoice" | "vendor_bill" | "project" | "activity";
  date: string; // YYYY-MM-DD
  title: string;
  subtitle?: string;
  status?: string;
  priority?: string;
  amount?: number;
  url?: string;
}

interface CalendarClientProps {
  tasks: Task[];
  invoices: Invoice[];
  vendorBills: VendorBill[];
  projects: Project[];
  activities: Activity[];
}

export function CalendarClient({
  tasks,
  invoices,
  vendorBills,
  projects,
  activities,
}: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "task" | "invoice" | "vendor_bill" | "project" | "activity">("all");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Convert CRM records to unified Calendar Events
  const events: CalendarEvent[] = [
    ...tasks
      .filter((t) => t.due_date)
      .map((t) => ({
        id: t.id,
        type: "task" as const,
        date: t.due_date!.split("T")[0],
        title: t.title,
        subtitle: t.project?.name || "Task",
        status: t.status,
        priority: t.priority,
        url: "/dashboard/tasks",
      })),
    ...invoices
      .filter((i) => i.due_date)
      .map((i) => ({
        id: i.id,
        type: "invoice" as const,
        date: i.due_date!.split("T")[0],
        title: `Invoice ${i.invoice_number}`,
        subtitle: i.client?.name || "Invoice",
        status: i.status,
        amount: i.total,
        url: "/dashboard/invoices",
      })),
    ...vendorBills
      .filter((b) => b.due_date)
      .map((b) => ({
        id: b.id,
        type: "vendor_bill" as const,
        date: b.due_date!.split("T")[0],
        title: `Bill ${b.bill_number}`,
        subtitle: b.vendor?.name || "Vendor",
        status: b.payment_status,
        amount: b.total_amount,
        url: "/dashboard/vendor-bills",
      })),
    ...projects
      .filter((p) => p.end_date)
      .map((p) => ({
        id: p.id,
        type: "project" as const,
        date: p.end_date!.split("T")[0],
        title: `Deadline: ${p.name}`,
        subtitle: p.client?.name || "Target Completion",
        status: p.status,
        amount: p.project_value,
        url: `/dashboard/projects/${p.id}`,
      })),
    ...activities
      .filter((a) => a.activity_date)
      .map((a) => ({
        id: a.id,
        type: "activity" as const,
        date: a.activity_date.split("T")[0],
        title: a.title,
        subtitle: a.type.toUpperCase(),
        url: "/dashboard/activities",
      })),
  ];

  const filteredEvents = events.filter(
    (e) => filterType === "all" || e.type === filterType
  );

  // Month grid calculation
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate calendar days
  const calendarCells: Array<{
    dayNumber: number;
    dateString: string;
    isCurrentMonth: boolean;
    isToday: boolean;
  }> = [];

  const todayStr = new Date().toISOString().split("T")[0];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, day);
    const dateString = prevMonthDate.toISOString().split("T")[0];
    calendarCells.push({
      dayNumber: day,
      dateString,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarCells.push({
      dayNumber: day,
      dateString,
      isCurrentMonth: true,
      isToday: dateString === todayStr,
    });
  }

  // Next month leading days to complete grid (42 cells = 6 weeks)
  const remainingCells = 42 - calendarCells.length;
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthDate = new Date(year, month + 1, day);
    const dateString = nextMonthDate.toISOString().split("T")[0];
    calendarCells.push({
      dayNumber: day,
      dateString,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
    });
  }

  const selectedDayEvents = selectedDate
    ? filteredEvents.filter((e) => e.date === selectedDate)
    : [];

  const formatCurrency = (amt?: number) => {
    if (!amt) return "";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const getEventBadgeClass = (type: CalendarEvent["type"], priority?: string) => {
    switch (type) {
      case "task":
        if (priority === "urgent" || priority === "high") {
          return "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-400 dark:border-rose-700";
        }
        return "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700";
      case "invoice":
        return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700";
      case "vendor_bill":
        return "bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700";
      case "project":
        return "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700";
      case "activity":
        return "bg-pink-100 dark:bg-pink-950/60 text-pink-800 dark:text-pink-300 border-pink-300 dark:border-pink-700";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 shadow-pop">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 border-2 border-[#1E293B] dark:border-slate-700 flex items-center justify-center text-[#8B5CF6] dark:text-violet-400 shadow-pop-sm">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#1E293B] dark:text-slate-100">
              {monthNames[month]} {year}
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {filteredEvents.length} events scheduled in total
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: "all", label: "All Events" },
            { key: "task", label: "Tasks" },
            { key: "invoice", label: "Invoices" },
            { key: "vendor_bill", label: "Vendor Bills" },
            { key: "project", label: "Deadlines" },
            { key: "activity", label: "Activities" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilterType(item.key as any)}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                filterType === item.key
                  ? "bg-[#1E293B] dark:bg-indigo-600 text-white border-[#1E293B] dark:border-indigo-500 shadow-pop-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#1E293B] dark:hover:border-slate-500"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-lg border-2 border-[#1E293B] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-black text-[#1E293B] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-pop-sm"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border-2 border-[#1E293B] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1E293B] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-pop-sm"
            title="Previous Month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border-2 border-[#1E293B] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1E293B] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-pop-sm"
            title="Next Month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Grid + Selected Day Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid (3 columns on desktop) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 shadow-pop overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 border-b-2 border-[#1E293B] dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-center py-2.5">
            {daysOfWeek.map((day, idx) => (
              <div
                key={day}
                className={`text-xs font-black tracking-wider uppercase ${
                  idx === 0 || idx === 6 ? "text-slate-400 dark:text-slate-500" : "text-[#1E293B] dark:text-slate-200"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
            {calendarCells.map((cell, idx) => {
              const dayEvents = filteredEvents.filter((e) => e.date === cell.dateString);
              const isSelected = selectedDate === cell.dateString;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(cell.dateString)}
                  className={`min-h-[96px] p-1.5 transition-all cursor-pointer flex flex-col justify-between ${
                    !cell.isCurrentMonth
                      ? "bg-slate-50/60 dark:bg-slate-950/40 opacity-40"
                      : "bg-white dark:bg-slate-900 hover:bg-violet-50/40 dark:hover:bg-slate-800/60"
                  } ${
                    cell.isToday
                      ? "bg-violet-50/60 dark:bg-indigo-950/30 ring-2 ring-violet-500 ring-inset"
                      : ""
                  } ${isSelected ? "ring-2 ring-[#1E293B] dark:ring-indigo-400 bg-amber-50/50 dark:bg-slate-800" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black rounded-md h-5 w-5 flex items-center justify-center ${
                        cell.isToday
                          ? "bg-violet-600 text-white shadow-sm"
                          : cell.isCurrentMonth
                          ? "text-[#1E293B] dark:text-slate-200"
                          : "text-slate-400 dark:text-slate-600"
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Micro Event Chips */}
                  <div className="space-y-1 mt-1 overflow-hidden max-h-[58px]">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[10px] font-bold truncate px-1.5 py-0.5 rounded border ${getEventBadgeClass(
                          ev.type,
                          ev.priority
                        )}`}
                        title={`${ev.title} (${ev.subtitle || ""})`}
                      >
                        {ev.type === "invoice" && "💰 "}
                        {ev.type === "vendor_bill" && "📦 "}
                        {ev.type === "task" && "✓ "}
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
            </div>
          </div>
        </div>

        {/* Selected Date Inspector Sidebar (1 column) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 shadow-pop p-5 flex flex-col">
          <div className="flex items-center justify-between border-b-2 border-[#1E293B]/10 dark:border-slate-800 pb-3 mb-4">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Schedule Details
              </p>
              <h4 className="text-lg font-black text-[#1E293B] dark:text-slate-100">
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Select a date"}
              </h4>
            </div>
            {selectedDate && (
              <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-[#8B5CF6] dark:text-violet-300 text-xs font-black border border-violet-300 dark:border-violet-700">
                {selectedDayEvents.length} item{selectedDayEvents.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {!selectedDate ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 my-auto">
              <Clock className="h-10 w-10 mx-auto mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">Click on any date on the calendar to view scheduled items</p>
            </div>
          ) : selectedDayEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 my-auto">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">No deadlines or events on this day</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Free schedule!</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
              {selectedDayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl border-2 border-[#1E293B] dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 shadow-pop-sm space-y-1.5 hover:bg-white dark:hover:bg-slate-800 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getEventBadgeClass(
                        ev.type,
                        ev.priority
                      )}`}
                    >
                      {ev.type.replace("_", " ")}
                    </span>
                    {ev.amount && (
                      <span className="text-xs font-black text-[#1E293B] dark:text-slate-100">
                        {formatCurrency(ev.amount)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-black text-[#1E293B] dark:text-slate-100 leading-tight">
                    {ev.title}
                  </p>

                  {ev.subtitle && (
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {ev.subtitle}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 capitalize">
                      {ev.status || "Scheduled"}
                    </span>
                    {ev.url && (
                      <Link
                        href={ev.url}
                        className="inline-flex items-center gap-1 text-[11px] font-black text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
