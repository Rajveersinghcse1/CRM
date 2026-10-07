import { getProjects, getClients } from "@/lib/crm-db";
import { formatINR } from "@/utils/finance-calc";
import { TrendingUp, Wallet, ShieldCheck, Award } from "lucide-react";
import Link from "next/link";
import { MoneyPosition } from "@/components/money-position";

export default async function ProfitabilityPage() {
  const [projectsRaw, clientsRaw] = await Promise.all([
    getProjects().catch(() => []),
    getClients().catch(() => []),
  ]);

  const projects = Array.isArray(projectsRaw) ? projectsRaw : [];
  const clients = Array.isArray(clientsRaw) ? clientsRaw : [];

  const totalContractValue = projects.reduce((sum, p) => sum + (Number(p.project_value) || 0), 0);
  const totalCollected = projects.reduce((sum, p) => sum + (Number(p.totalCollected) || 0), 0);
  const totalClientPending = projects.reduce((sum, p) => sum + (p.clientPending ?? Math.max(0, (Number(p.project_value) || 0) - (Number(p.totalCollected) || 0))), 0);
  const totalActualCost = projects.reduce((sum, p) => sum + (Number(p.totalActualCost) || 0), 0);
  const totalAvailableBalance = totalCollected - totalActualCost;
  const totalExpectedProfit = totalContractValue - totalActualCost;
  const overallMargin = totalContractValue > 0 ? Math.round(((totalExpectedProfit / totalContractValue) * 100)) : 0;

  // Client Profitability Aggregation
  const clientProfitMap: Record<
    string,
    { client: typeof clients[0]; contract: number; collected: number; cost: number; profit: number; margin: number; count: number }
  > = {};

  for (const p of projects) {
    const cid = p.client_id;
    if (!clientProfitMap[cid]) {
      const c = clients.find((client) => client.id === cid) || { id: cid, name: "Client", company_name: "" } as any;
      clientProfitMap[cid] = { client: c, contract: 0, collected: 0, cost: 0, profit: 0, margin: 0, count: 0 };
    }
    clientProfitMap[cid].contract += Number(p.project_value) || 0;
    clientProfitMap[cid].collected += Number(p.totalCollected) || 0;
    clientProfitMap[cid].cost += Number(p.totalActualCost) || 0;
    clientProfitMap[cid].profit += (p.expectedProfit ?? ((Number(p.project_value) || 0) - (Number(p.totalActualCost) || 0)));
    clientProfitMap[cid].count += 1;
  }

  const clientProfitList = Object.values(clientProfitMap).map((cp) => ({
    ...cp,
    margin: cp.contract > 0 ? Math.round((cp.profit / cp.contract) * 100) : 0,
  })).sort((a, b) => b.profit - a.profit);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Profitability & Financial Performance
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Portfolio Margins
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Expected gross profit on total contract value vs. unspent collected balance across projects and clients.
          </p>
        </div>
      </div>

      {/* Top Money Position Component */}
      <MoneyPosition
        title="Consolidated Portfolio Profitability"
        subtitle="Expected final margins upon 100% client collection vs unspent operational funds"
        contractValue={totalContractValue}
        totalCollected={totalCollected}
        clientPending={totalClientPending}
        totalExpenses={totalActualCost}
        availableBalance={totalAvailableBalance}
        expectedProfit={totalExpectedProfit}
        expectedMarginPct={overallMargin}
      />

      {/* Section 1: Project-by-Project Profitability */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Project Profitability Ranking
          </span>
          <span className="text-[11px] text-slate-400">
            Sorted by Contract Expected Profit
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3 text-left">Project</th>
                <th className="px-3 py-3.5 text-left">Client</th>
                <th className="px-3 py-3.5 text-left">Contract Value</th>
                <th className="px-3 py-3.5 text-left">Collected</th>
                <th className="px-3 py-3.5 text-left">Expenses</th>
                <th className="px-3 py-3.5 text-left">Available Balance</th>
                <th className="px-3 py-3.5 text-left">Expected Profit</th>
                <th className="px-3 py-3.5 text-right pr-5">Expected Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {projects.map((p) => {
                const collected = p.totalCollected || 0;
                const expenses = p.totalActualCost || 0;
                const available = p.availableBalance ?? (collected - expenses);
                const profit = p.expectedProfit ?? ((Number(p.project_value) || 0) - expenses);
                const margin = p.expectedMargin ?? (
                  p.project_value > 0 ? Math.round((profit / p.project_value) * 100) : 0
                );

                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="whitespace-nowrap py-3.5 pl-5 pr-3 font-bold text-slate-900">
                      <Link href={`/dashboard/projects/${p.id}`} className="hover:underline hover:text-indigo-600 font-bold">
                        {p.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-slate-700">
                      {p.client?.name || "Client"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-bold text-slate-900">
                      {formatINR(p.project_value)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-bold text-emerald-700">
                      {formatINR(collected)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-bold text-rose-700">
                      {formatINR(expenses)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${
                        available >= 0
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-rose-50 text-rose-800 border-rose-200"
                      }`}>
                        {formatINR(available)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-bold text-slate-900">
                      {formatINR(profit)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-right pr-5">
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        {margin}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Client Account Profitability */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Client Account Margin Breakdown
          </span>
          <span className="text-[11px] text-slate-400">
            Lifetime account profitability
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3 text-left">Client Name</th>
                <th className="px-3 py-3.5 text-left">Projects</th>
                <th className="px-3 py-3.5 text-left">Total Contracts</th>
                <th className="px-3 py-3.5 text-left">Collected Cash</th>
                <th className="px-3 py-3.5 text-left">Total Expenses</th>
                <th className="px-3 py-3.5 text-left">Expected Profit</th>
                <th className="px-3 py-3.5 text-right pr-5">Expected Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {clientProfitList.map((cp) => (
                <tr key={cp.client.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="whitespace-nowrap py-3.5 pl-5 pr-3 font-bold text-slate-900">
                    <Link href={`/dashboard/clients/${cp.client.id}`} className="hover:underline hover:text-indigo-600 font-bold">
                      {cp.client.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-600 font-medium">
                    {cp.count} project{cp.count !== 1 ? "s" : ""}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-bold text-slate-900">
                    {formatINR(cp.contract)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-bold text-emerald-700">
                    {formatINR(cp.collected)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-bold text-rose-700">
                    {formatINR(cp.cost)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-bold text-slate-900">
                    {formatINR(cp.profit)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right pr-5">
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
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
