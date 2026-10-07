import { fetchRevenue, fetchClients, fetchServices } from "@/app/actions/wexlogic-actions";
import { requireRole } from "@/utils/auth";
import { RevenueForm } from "./revenue-form";
import { Coins, DollarSign } from "lucide-react";

export default async function RevenuePage() {
  const { role } = await requireRole(["admin", "manager", "sales"]);
  const [revenueRaw, clientsRaw, servicesRaw] = await Promise.all([
    fetchRevenue().catch(() => []),
    fetchClients().catch(() => []),
    fetchServices().catch(() => []),
  ]);

  const revenue = Array.isArray(revenueRaw) ? revenueRaw : [];
  const clients = Array.isArray(clientsRaw) ? clientsRaw : [];
  const services = Array.isArray(servicesRaw) ? servicesRaw : [];

  const canAdd = role === "admin" || role === "sales";

  const totalRevenue = revenue.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b-2 border-[#1E293B]/10 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border-2 border-[#1E293B] dark:border-amber-700/60">
              <DollarSign className="h-4 w-4 text-[#D97706] dark:text-amber-400" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-[#1E293B] dark:text-slate-100 font-display">
              Revenue & Invoices
            </h2>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
            Track and log all pending and paid service invoices for client engagements.
          </p>
        </div>
        {canAdd && <RevenueForm clients={clients} services={services} />}
      </div>

      {/* Total Revenue Summary Card */}
      <div className="flex items-center gap-4 rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-pop">
        <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/60 border-2 border-[#1E293B] dark:border-amber-700/60 flex items-center justify-center text-[#D97706] dark:text-amber-400 shadow-pop-sm shrink-0">
          <Coins className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Pipeline Revenue
          </p>
          <p className="text-3xl font-black text-[#1E293B] dark:text-slate-100 mt-0.5">
            {formatINR(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Revenue Table Card */}
      <div className="overflow-hidden rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-pop">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-[#1E293B]/10 dark:divide-slate-800">
            <thead className="bg-[#FFFDF5] dark:bg-slate-800/80 border-b-2 border-[#1E293B] dark:border-slate-800">
              <tr>
                <th
                  scope="col"
                  className="py-4 pl-4 pr-3 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200 sm:pl-6"
                >
                  Client
                </th>
                <th
                  scope="col"
                  className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200"
                >
                  Service
                </th>
                <th
                  scope="col"
                  className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200"
                >
                  Date Logged
                </th>
                <th
                  scope="col"
                  className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] dark:text-slate-200"
                >
                  Added By
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1E293B]/10 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {revenue.map((item) => (
                <tr key={item.id} className="hover:bg-violet-50/40 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-[#1E293B] dark:text-slate-100 sm:pl-6">
                    <div>{item.client?.name}</div>
                    <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {item.client?.company_name}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 text-xs text-slate-700 dark:text-slate-300">
                      {item.service?.name || "Service"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-black text-[#1E293B] dark:text-slate-100">
                    {formatINR(Number(item.amount))}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-black border-2 shadow-pop-sm ${
                        item.status === "paid"
                          ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 border-[#34D399] dark:border-emerald-700/60"
                          : "bg-amber-100 dark:bg-amber-950/50 text-amber-950 dark:text-amber-300 border-[#FBBF24] dark:border-amber-700/60"
                      }`}
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className="text-xs font-bold text-[#8B5CF6] dark:text-purple-400 bg-violet-50 dark:bg-purple-950/40 px-2 py-0.5 rounded border border-violet-200 dark:border-purple-800/60">
                      {item.creator?.full_name || "System"}
                    </span>
                  </td>
                </tr>
              ))}
              {revenue.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm font-medium text-slate-400 dark:text-slate-500">
                    No revenue records found. Click "Log Payment" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
