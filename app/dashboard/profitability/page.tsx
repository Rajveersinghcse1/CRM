import { getProjects, getClients } from "@/lib/crm-db";
import { formatINR } from "@/utils/finance-calc";
import { TrendingUp, Award, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function ProfitabilityPage() {
  const [projectsRaw, clientsRaw] = await Promise.all([
    getProjects().catch(() => []),
    getClients().catch(() => []),
  ]);

  const projects = Array.isArray(projectsRaw) ? projectsRaw : [];
  const clients = Array.isArray(clientsRaw) ? clientsRaw : [];

  const totalContractValue = projects.reduce((sum, p) => sum + (Number(p.project_value) || 0), 0);
  const totalCollected = projects.reduce((sum, p) => sum + (Number(p.totalCollected) || 0), 0);
  const totalActualCost = projects.reduce((sum, p) => sum + (Number(p.totalActualCost) || 0), 0);
  const totalGrossProfit = totalCollected - totalActualCost;
  const overallMargin = totalCollected > 0 ? ((totalGrossProfit / totalCollected) * 100).toFixed(1) : "0.0";

  // Client Profitability Aggregation
  const clientProfitMap: Record<
    string,
    { client: typeof clients[0]; revenue: number; cost: number; profit: number; margin: number; count: number }
  > = {};

  for (const p of projects) {
    const cid = p.client_id;
    if (!clientProfitMap[cid]) {
      const c = clients.find((client) => client.id === cid) || { id: cid, name: "Client", company_name: "" } as any;
      clientProfitMap[cid] = { client: c, revenue: 0, cost: 0, profit: 0, margin: 0, count: 0 };
    }
    clientProfitMap[cid].revenue += p.totalCollected || 0;
    clientProfitMap[cid].cost += p.totalActualCost || 0;
    clientProfitMap[cid].profit += p.grossProfit || 0;
    clientProfitMap[cid].count += 1;
  }

  const clientProfitList = Object.values(clientProfitMap).map((cp) => ({
    ...cp,
    margin: cp.revenue > 0 ? ((cp.profit / cp.revenue) * 100).toFixed(1) : "0.0",
  })).sort((a, b) => b.profit - a.profit);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b-2 border-[#1E293B]/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-emerald-100 border-2 border-[#1E293B]">
              <TrendingUp className="h-4 w-4 text-emerald-700" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-[#1E293B]">
              Profitability & Financial Margins
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">
            Realized gross profit and margin performance across company projects and client accounts.
          </p>
        </div>
      </div>

      {/* Executive Financial Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-4 shadow-pop flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-black uppercase text-slate-500">Gross Contract Value</p>
            <p className="text-2xl font-black text-[#1E293B] mt-0.5">{formatINR(totalContractValue)}</p>
          </div>
          <span className="text-[10px] font-bold text-slate-400 mt-1">Deal Close Total</span>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-4 shadow-pop flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-black uppercase text-slate-500">Collected Cash</p>
            <p className="text-2xl font-black text-emerald-800 mt-0.5">{formatINR(totalCollected)}</p>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 mt-1">Cash Received</span>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-4 shadow-pop flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-black uppercase text-slate-500">Actual Delivery Costs</p>
            <p className="text-2xl font-black text-rose-700 mt-0.5">{formatINR(totalActualCost)}</p>
          </div>
          <span className="text-[10px] font-bold text-rose-700 mt-1">Expenses Logged</span>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-4 shadow-pop flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-black uppercase text-slate-500">Gross Profit Realized</p>
            <p className="text-2xl font-black text-emerald-800 mt-0.5">{formatINR(totalGrossProfit)}</p>
          </div>
          <span className="text-[10px] font-bold text-slate-500 mt-1">Collected − Cost</span>
        </div>
        <div className="rounded-2xl border-2 border-[#1E293B] bg-white p-4 shadow-pop flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-black uppercase text-slate-500">Gross Margin %</p>
            <p className="text-2xl font-black text-[#8B5CF6] mt-0.5">{overallMargin}%</p>
          </div>
          <span className="text-[10px] font-bold text-purple-700 mt-1">Profit / Collected</span>
        </div>
      </div>

      {/* Section 1: Project-by-Project Profitability */}
      <div className="rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop overflow-hidden">
        <div className="p-4 border-b-2 border-[#1E293B] bg-[#FFFDF5] flex items-center justify-between">
          <h3 className="font-black text-xs uppercase tracking-wider text-[#1E293B]">
            Project Profitability Ranking
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            Sorted by Gross Profit Realized
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-[#1E293B]/10">
            <thead className="bg-[#FFFDF5] border-b border-slate-200">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] sm:pl-6">
                  Project
                </th>
                <th className="px-3 py-3.5 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Client
                </th>
                <th className="px-3 py-3.5 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Contract Value
                </th>
                <th className="px-3 py-3.5 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Collected Cash
                </th>
                <th className="px-3 py-3.5 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Actual Cost
                </th>
                <th className="px-3 py-3.5 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Gross Profit
                </th>
                <th className="px-3 py-3.5 text-right text-xs font-black uppercase tracking-wider text-[#1E293B] pr-6">
                  Gross Margin %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1E293B]/10 bg-white">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-violet-50/40 transition-colors">
                  <td className="whitespace-nowrap py-3.5 pl-4 pr-3 text-sm font-bold text-[#1E293B] sm:pl-6">
                    <Link href={`/dashboard/projects/${p.id}`} className="hover:underline text-[#1E293B]">
                      {p.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-xs font-semibold text-slate-700">
                    {p.client?.name || "Client"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-xs font-black text-[#1E293B]">
                    {formatINR(p.project_value)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-xs font-bold text-emerald-800">
                    {formatINR(p.totalCollected || 0)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-xs font-bold text-rose-700">
                    {formatINR(p.totalActualCost || 0)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-xs font-black text-emerald-800">
                    {formatINR(p.grossProfit || 0)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right pr-6">
                    <span className="rounded-full bg-emerald-100 border border-[#34D399] px-2.5 py-0.5 text-xs font-black text-emerald-950">
                      {p.grossMargin?.toFixed(1) || "0.0"}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Client Account Profitability */}
      <div className="rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop overflow-hidden">
        <div className="p-4 border-b-2 border-[#1E293B] bg-[#FFFDF5] flex items-center justify-between">
          <h3 className="font-black text-xs uppercase tracking-wider text-[#1E293B]">
            Client Account Margin Breakdown
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            Lifetime account profitability
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-[#1E293B]/10">
            <thead className="bg-[#FFFDF5] border-b border-slate-200">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] sm:pl-6">
                  Client Name
                </th>
                <th className="px-3 py-3.5 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Projects
                </th>
                <th className="px-3 py-3.5 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Collected Cash
                </th>
                <th className="px-3 py-3.5 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Total Cost
                </th>
                <th className="px-3 py-3.5 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Gross Profit
                </th>
                <th className="px-3 py-3.5 text-right text-xs font-black uppercase tracking-wider text-[#1E293B] pr-6">
                  Margin %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1E293B]/10 bg-white">
              {clientProfitList.map((cp) => (
                <tr key={cp.client.id} className="hover:bg-violet-50/40 transition-colors">
                  <td className="whitespace-nowrap py-3.5 pl-4 pr-3 text-sm font-bold text-[#1E293B] sm:pl-6">
                    <Link href={`/dashboard/clients/${cp.client.id}`} className="hover:underline text-[#1E293B]">
                      {cp.client.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-xs font-semibold text-slate-600">
                    {cp.count} project{cp.count !== 1 ? "s" : ""}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-xs font-black text-[#1E293B]">
                    {formatINR(cp.revenue)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-xs font-bold text-rose-700">
                    {formatINR(cp.cost)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-xs font-black text-emerald-800">
                    {formatINR(cp.profit)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right pr-6">
                    <span className="rounded-full bg-emerald-100 border border-[#34D399] px-2.5 py-0.5 text-xs font-black text-emerald-950">
                      {cp.margin}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
