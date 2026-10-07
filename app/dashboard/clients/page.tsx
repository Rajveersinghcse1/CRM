import { getClients } from "@/lib/crm-db";
import { requireRole } from "@/utils/auth";
import { ClientForm, DeleteClientButton } from "./client-form";
import { Users, ExternalLink, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default async function ClientsPage() {
  const { role } = await requireRole(["admin", "manager", "sales", "employee", "viewer"]);
  const clients = await getClients();
  const canAdd = role === "admin" || role === "manager" || role === "sales";

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700">
              <Users className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Clients Directory
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {clients.length} Accounts
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Client accounts, corporate contacts, and project engagements.
          </p>
        </div>
        {canAdd && <ClientForm />}
      </div>

      {/* Clients Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-5 pr-3 text-left"
                >
                  Client / Contact
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left"
                >
                  Company Name
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left"
                >
                  Email & Phone
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-right pr-5"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="whitespace-nowrap py-3.5 pl-5 pr-3 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="hover:underline hover:text-indigo-600 text-slate-900 font-bold"
                        >
                          {client.name}
                        </Link>
                        {client.designation && (
                          <p className="text-[10px] text-slate-400 font-normal">{client.designation}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-700">
                    <span className="bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {client.company_name}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-600">
                    <div>{client.email}</div>
                    {client.phone && <div className="text-slate-400 text-[10px] mt-0.5">{client.phone}</div>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5">
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 font-bold uppercase text-emerald-800 text-[10px]">
                      {client.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right pr-5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 shadow-2xs transition-all"
                      >
                        <span>Profile</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                      {canAdd && (
                        <>
                          <ClientForm initialData={client} />
                          <DeleteClientButton id={client.id} name={client.name} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                    No clients found. Click "+ Client" to add your first client account.
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
