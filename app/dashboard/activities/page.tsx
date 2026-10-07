import { getActivities, getClients, getProjects } from "@/lib/crm-db";
import { getCurrentUserRole, canMutateSales } from "@/utils/auth";
import { ActivityModal, DeleteActivityButton } from "./activity-modal";
import { Activity, Phone, Users, MessageSquare, Mail, Calendar, FileText } from "lucide-react";

export default async function ActivitiesPage() {
  const [activities, clients, projects, role] = await Promise.all([
    getActivities(),
    getClients(),
    getProjects(),
    getCurrentUserRole(),
  ]);
  const canAdd = canMutateSales(role);

  const TYPE_ICONS: Record<string, { icon: any; color: string }> = {
    call: { icon: Phone, color: "text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60" },
    meeting: { icon: Users, color: "text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60" },
    whatsapp: { icon: MessageSquare, color: "text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60" },
    email: { icon: Mail, color: "text-amber-600 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60" },
    follow_up: { icon: Calendar, color: "text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/60" },
    note: { icon: FileText, color: "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800" },
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b-2 border-[#1E293B]/10 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-pink-100 dark:bg-pink-950/60 border-2 border-[#1E293B] dark:border-slate-700">
              <Activity className="h-4 w-4 text-pink-700 dark:text-pink-300" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-[#1E293B] dark:text-slate-100">
              Activity & Interaction Timeline
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
            Chronological audit of calls, client meetings, WhatsApp messages, emails, and follow-ups.
          </p>
        </div>
        {canAdd && <ActivityModal clients={clients} projects={projects} />}
      </div>

      {/* Activity Timeline Card */}
      <div className="rounded-2xl border-2 border-[#1E293B] dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-pop">
        <div className="space-y-6">
          {activities.map((act) => {
            const typeConfig = TYPE_ICONS[act.type] || TYPE_ICONS.note;
            const Icon = typeConfig.icon;

            return (
              <div key={act.id} className="flex items-start gap-4">
                <div
                  className={`h-10 w-10 rounded-xl border-2 border-[#1E293B] dark:border-slate-700 flex items-center justify-center shrink-0 shadow-pop-sm ${typeConfig.color}`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0 border-b-2 border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-[#1E293B] dark:text-slate-100">{act.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                        {new Date(act.activity_date).toLocaleString()}
                      </span>
                      {canAdd && (
                        <div className="flex items-center gap-1">
                          <ActivityModal clients={clients} projects={projects} initialData={act} />
                          <DeleteActivityButton id={act.id} title={act.title} />
                        </div>
                      )}
                    </div>
                  </div>
                  {act.description && (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      {act.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {activities.length === 0 && (
            <div className="py-12 text-center text-sm font-medium text-slate-400">
              No activities logged yet.{canAdd ? " Click \"Log Activity\" to start tracking communications." : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
