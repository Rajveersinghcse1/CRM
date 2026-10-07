import { getCompanies, getClients } from "@/lib/crm-db";
import { getCurrentUserRole, canMutateSales } from "@/utils/auth";
import { CompanyModal, DeleteCompanyButton } from "./company-modal";
import { Building2, Globe, MapPin } from "lucide-react";
import Link from "next/link";

export default async function CompaniesPage() {
  const [companies, clients, role] = await Promise.all([
    getCompanies(),
    getClients(),
    getCurrentUserRole(),
  ]);

  const canAdd = canMutateSales(role);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b-2 border-[#1E293B]/10 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 border-2 border-[#1E293B] dark:border-slate-700">
              <Building2 className="h-4 w-4 text-indigo-700 dark:text-indigo-400" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-[#1E293B] dark:text-slate-100">
              B2B Companies
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
            Corporate accounts, group entities, and parent companies associated with multiple client contacts.
          </p>
        </div>
        {canAdd && <CompanyModal />}
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((comp) => {
          const companyClients = clients.filter((c) => c.company_id === comp.id || c.company_name === comp.name);
          return (
            <div
              key={comp.id}
              className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 border-2 border-[#1E293B] dark:border-slate-700 flex items-center justify-center text-sm font-black text-indigo-800 dark:text-indigo-300 shrink-0">
                    {comp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#1E293B] dark:text-slate-100">{comp.name}</h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{comp.industry || "General Business"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-950 dark:text-emerald-300 border border-[#34D399] dark:border-emerald-800">
                    {comp.status}
                  </span>
                  {canAdd && (
                    <div className="flex items-center gap-1">
                      <CompanyModal initialData={comp} />
                      <DeleteCompanyButton id={comp.id} name={comp.name} />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                {comp.city && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{comp.city}, {comp.state || "India"}</span>
                  </div>
                )}
                {comp.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    <a href={comp.website} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline truncate">
                      {comp.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t-2 border-[#1E293B]/10 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-[#1E293B] dark:text-slate-200">
                  {companyClients.length} Linked Contact{companyClients.length !== 1 ? "s" : ""}
                </span>
                <Link
                  href={`/dashboard/clients?company=${encodeURIComponent(comp.name)}`}
                  className="font-bold text-[#8B5CF6] dark:text-purple-400 hover:underline"
                >
                  View Contacts →
                </Link>
              </div>
            </div>
          );
        })}

        {companies.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm font-medium text-slate-400 dark:text-slate-500">
            {canAdd
              ? 'No companies registered. Click "Add Company" to add your first corporate account.'
              : "No companies registered."}
          </div>
        )}
      </div>
    </div>
  );
}
