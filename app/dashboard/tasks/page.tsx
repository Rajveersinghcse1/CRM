import { getTasks, getProjects } from "@/lib/crm-db";
import { getCurrentUserRole, canMutateTasks } from "@/utils/auth";
import { TaskModal, DeleteTaskButton } from "./task-modal";
import { CheckSquare } from "lucide-react";
import Link from "next/link";

export default async function TasksPage() {
  const [tasksRaw, projectsRaw, role] = await Promise.all([
    getTasks().catch((err) => {
      console.warn("TasksPage getTasks error:", err);
      return [];
    }),
    getProjects().catch((err) => {
      console.warn("TasksPage getProjects error:", err);
      return [];
    }),
    getCurrentUserRole().catch(() => "employee" as const),
  ]);

  const tasks = Array.isArray(tasksRaw) ? tasksRaw : [];
  const projects = Array.isArray(projectsRaw) ? projectsRaw : [];
  const canAdd = canMutateTasks(role);

  const PRIORITY_BADGES: Record<string, { bg: string; text: string }> = {
    low: { bg: "bg-slate-100 text-slate-700", text: "Low" },
    medium: { bg: "bg-blue-100 text-blue-900", text: "Medium" },
    high: { bg: "bg-amber-100 text-amber-950", text: "High" },
    urgent: { bg: "bg-rose-100 text-rose-950", text: "Urgent" },
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b-2 border-[#1E293B]/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-blue-100 border-2 border-[#1E293B]">
              <CheckSquare className="h-4 w-4 text-blue-700" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-[#1E293B]">
              Tasks & Deliverables
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">
            Operational action items, milestones, and deliverables tied to projects and categories.
          </p>
        </div>
        {canAdd && <TaskModal projects={projects} />}
      </div>

      {/* Tasks Table */}
      <div className="overflow-hidden rounded-2xl border-2 border-[#1E293B] bg-white shadow-pop">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-[#1E293B]/10">
            <thead className="bg-[#FFFDF5] border-b-2 border-[#1E293B]">
              <tr>
                <th className="py-4 pl-4 pr-3 text-left text-xs font-black uppercase tracking-wider text-[#1E293B] sm:pl-6">
                  Task Title
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Project
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Priority
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Due Date
                </th>
                <th className="px-3 py-4 text-left text-xs font-black uppercase tracking-wider text-[#1E293B]">
                  Status
                </th>
                {canAdd && (
                  <th className="px-3 py-4 text-right text-xs font-black uppercase tracking-wider text-[#1E293B] pr-6">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1E293B]/10 bg-white">
              {tasks.map((task, idx) => {
                const priority = (task.priority && PRIORITY_BADGES[task.priority]) || PRIORITY_BADGES.medium;
                const statusLabel = task.status ? String(task.status).replace(/_/g, " ") : "pending";
                const taskId = task.id || `task-${idx}`;
                return (
                  <tr key={taskId} className="hover:bg-violet-50/40 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-[#1E293B] sm:pl-6">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`h-2.5 w-2.5 rounded-full border border-[#1E293B] ${
                            task.status === "completed" ? "bg-[#34D399]" : "bg-amber-400"
                          }`}
                        />
                        <span>{task.title || "Untitled Task"}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-semibold text-slate-700">
                      {task.project && task.project_id ? (
                        <Link
                          href={`/dashboard/projects/${task.project_id}`}
                          className="hover:underline text-indigo-700 font-bold"
                        >
                          {task.project.name || "Project"}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase border border-slate-300 ${priority.bg}`}>
                        {priority.text}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-xs font-medium text-slate-500">
                      {task.due_date ? (() => {
                        try {
                          const d = new Date(task.due_date);
                          return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
                        } catch {
                          return "—";
                        }
                      })() : "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black border uppercase tracking-wider ${
                          task.status === "completed"
                            ? "bg-emerald-100 text-emerald-950 border-[#34D399]"
                            : "bg-amber-100 text-amber-950 border-[#FBBF24]"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    {canAdd && (
                      <td className="whitespace-nowrap px-3 py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <TaskModal projects={projects} initialData={task} />
                          <DeleteTaskButton id={taskId} name={task.title || "Task"} projectId={task.project_id || undefined} />
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={canAdd ? 6 : 5} className="py-12 text-center text-sm font-medium text-slate-400">
                    {canAdd ? 'No tasks found. Click "Add Task" to create one.' : "No tasks found."}
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
