export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Sleek Top Progress Indicator */}
      <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full animate-indeterminate" style={{ width: "40%" }} />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-96 max-w-full bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
      </div>

      {/* Star Feature: Executive Money Position Skeleton */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-950/60 rounded-lg" />
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="h-6 w-32 bg-slate-100 dark:bg-slate-800 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-40 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800" />
          <div className="h-40 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800" />
        </div>

        <div className="h-16 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800" />
      </div>

      {/* Grid Columns Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm" />
          <div className="h-56 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm" />
        </div>
        <div className="space-y-6">
          <div className="h-64 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm" />
          <div className="h-56 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm" />
        </div>
      </div>
    </div>
  );
}
