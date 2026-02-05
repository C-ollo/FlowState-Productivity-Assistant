"use client";

import { CheckSquare, Plus } from "lucide-react";

const tasks = [
  {
    id: 1,
    title: "Review Q4 budget proposal",
    status: "in_progress",
    priority: "high",
    dueDate: "Today",
  },
  {
    id: 2,
    title: "Prepare slides for design sync",
    status: "pending",
    priority: "medium",
    dueDate: "Tomorrow",
  },
  {
    id: 3,
    title: "Reply to Sarah about typography tokens",
    status: "pending",
    priority: "high",
    dueDate: "Today",
  },
  {
    id: 4,
    title: "Schedule 1:1 with Jordan",
    status: "completed",
    priority: "low",
    dueDate: "Completed",
  },
];

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Tasks</h1>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors">
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 hover:border-border-light transition-colors"
          >
            <button
              className={`flex h-5 w-5 items-center justify-center rounded border ${
                task.status === "completed"
                  ? "border-success bg-success"
                  : "border-border hover:border-primary"
              }`}
            >
              {task.status === "completed" && (
                <CheckSquare className="h-3 w-3 text-white" />
              )}
            </button>
            <div className="flex-1">
              <p
                className={`font-medium ${
                  task.status === "completed"
                    ? "text-text-muted line-through"
                    : "text-text"
                }`}
              >
                {task.title}
              </p>
            </div>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                task.priority === "high"
                  ? "bg-urgent/10 text-urgent"
                  : task.priority === "medium"
                  ? "bg-warning/10 text-warning"
                  : "bg-surface-hover text-text-muted"
              }`}
            >
              {task.priority}
            </span>
            <span className="text-sm text-text-muted">{task.dueDate}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
