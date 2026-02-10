"use client";

import { useState } from "react";
import { useTasks, useCompleteTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useUser } from "@/hooks/use-auth";
import { Task, TaskPriority, TaskStatus } from "@/types";

const statusFilters: { label: string; value: TaskStatus | null }[] = [
  { label: "All", value: null },
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" },
];

function formatDueDate(date: string | undefined | null): string {
  if (!date) return "";
  const due = new Date(date);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays === 0) return "Due earlier today";
    if (absDays === 1) return "Due yesterday";
    return `${absDays} days overdue`;
  }

  if (diffHours < 1) return "Due in < 1 hour";
  if (diffHours < 24) return `Due in ${diffHours}h`;
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays < 7) return `Due in ${diffDays} days`;

  return `Due ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function getPriorityStyle(priority: TaskPriority): { label: string; color: string } {
  switch (priority) {
    case "urgent":
      return { label: "URGENT", color: "bg-red-500/10 text-red-400" };
    case "high":
      return { label: "HIGH", color: "bg-orange-500/10 text-orange-400" };
    case "medium":
      return { label: "MEDIUM", color: "bg-amber-500/10 text-amber-400" };
    case "low":
      return { label: "LOW", color: "bg-border-dark text-text-muted" };
  }
}

function isOverdue(date: string | undefined | null): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

function getPlatformStyle(platform: string | undefined): { icon: string; label: string; color: string; bg: string } {
  switch (platform) {
    case "gmail":
      return { icon: "mail", label: "Gmail", color: "text-[#EA4335]", bg: "bg-[#EA4335]/10" };
    case "slack":
      return { icon: "chat", label: "Slack", color: "text-[#E01E5A]", bg: "bg-[#E01E5A]/10" };
    case "calendar":
      return { icon: "calendar_month", label: "Calendar", color: "text-[#4285F4]", bg: "bg-[#4285F4]/10" };
    default:
      return { icon: "task_alt", label: "Manual", color: "text-text-muted", bg: "bg-border-dark" };
  }
}

export default function TasksPage() {
  const [activeFilter, setActiveFilter] = useState<TaskStatus | null>(null);
  const { data: user } = useUser();

  const { data: tasksData, isLoading } = useTasks(
    activeFilter ? { status: activeFilter } : undefined
  );
  const completeTask = useCompleteTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const tasks: Task[] = Array.isArray(tasksData)
    ? tasksData
    : tasksData?.items || [];

  function handleToggleComplete(task: Task) {
    if (task.status === "done") {
      updateTask.mutate({ id: task.id, data: { status: "todo" } });
    } else {
      completeTask.mutate(task.id);
    }
  }

  function handleDelete(e: React.MouseEvent, taskId: string) {
    e.stopPropagation();
    deleteTask.mutate(taskId);
  }

  return (
    <>
      {/* Header Section */}
      <header className="border-b border-border-dark px-8 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Tasks</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">
                search
              </span>
              <input
                className="w-full bg-border-dark border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary placeholder:text-text-muted"
                placeholder="Search tasks..."
                type="text"
              />
            </div>
            <button className="p-2 bg-border-dark rounded-lg text-text-muted hover:text-white transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {statusFilters.map((filter) => (
            <button
              key={filter.label}
              onClick={() => setActiveFilter(filter.value)}
              className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 cursor-pointer transition-colors ${
                activeFilter === filter.value
                  ? "bg-primary"
                  : "bg-border-dark hover:bg-surface-dark"
              }`}
            >
              <p
                className={`text-sm font-medium leading-normal ${
                  activeFilter === filter.value ? "text-white" : "text-text-muted"
                }`}
              >
                {filter.label}
              </p>
            </button>
          ))}
        </div>
      </header>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <span className="material-symbols-outlined text-primary text-3xl animate-spin">
              progress_activity
            </span>
          </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task: Task) => {
              const isDone = task.status === "done";
              const priorityStyle = getPriorityStyle(task.priority);
              const overdue = !isDone && isOverdue(task.due_at);
              const platform = getPlatformStyle(task.source_platform);

              return (
                <div
                  key={task.id}
                  className="bg-surface-dark rounded-xl border border-border-dark p-4 hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isDone
                          ? "bg-green-500 border-green-500"
                          : "border-border-dark hover:border-primary"
                      }`}
                    >
                      {isDone && (
                        <span className="material-symbols-outlined text-white text-sm">
                          check
                        </span>
                      )}
                    </button>

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-sm font-bold ${
                          isDone ? "text-text-muted line-through" : "text-white"
                        }`}
                      >
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`material-symbols-outlined ${platform.color} text-sm`}>
                          {platform.icon}
                        </span>
                        <span className="text-xs text-text-muted">{platform.label}</span>
                      </div>
                    </div>

                    {/* Priority Badge */}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${priorityStyle.color}`}
                    >
                      {priorityStyle.label}
                    </span>

                    {/* Due Date */}
                    {task.due_at && (
                      <span
                        className={`text-xs whitespace-nowrap shrink-0 ${
                          overdue ? "text-red-400 font-medium" : "text-text-muted"
                        }`}
                      >
                        {isDone ? "Completed" : formatDueDate(task.due_at)}
                      </span>
                    )}

                    {/* Delete */}
                    <button
                      onClick={(e) => handleDelete(e, task.id)}
                      className="material-symbols-outlined text-text-muted text-lg opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all shrink-0"
                    >
                      delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface-dark rounded-xl border border-border-dark p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-text-muted mb-2">
              task_alt
            </span>
            <p className="text-text-muted font-medium">
              {activeFilter ? "No tasks with this status" : "No tasks yet"}
            </p>
            <p className="text-sm text-text-muted mt-1">
              Tasks created from deadlines or manually will appear here
            </p>
          </div>
        )}
      </div>
    </>
  );
}
