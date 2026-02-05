"use client";

import { useState } from "react";

const statusFilters = ["All", "To Do", "In Progress", "Done"];

const tasks = [
  {
    id: 1,
    title: "Review Q4 budget proposal",
    status: "in_progress",
    priority: "high",
    dueDate: "Today, 5:00 PM",
    source: "Gmail",
    sourceIcon: "mail",
    sourceColor: "text-gmail",
  },
  {
    id: 2,
    title: "Prepare slides for design sync",
    status: "pending",
    priority: "medium",
    dueDate: "Tomorrow, 10:00 AM",
    source: "Calendar",
    sourceIcon: "calendar_month",
    sourceColor: "text-calendar",
  },
  {
    id: 3,
    title: "Reply to Sarah about typography tokens",
    status: "pending",
    priority: "high",
    dueDate: "Today, EOD",
    source: "Slack",
    sourceIcon: "alternate_email",
    sourceColor: "text-slack",
  },
  {
    id: 4,
    title: "Schedule 1:1 with Jordan",
    status: "completed",
    priority: "low",
    dueDate: "Completed",
    source: "Slack",
    sourceIcon: "alternate_email",
    sourceColor: "text-slack",
  },
];

export default function TasksPage() {
  const [activeFilter, setActiveFilter] = useState("All");

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
              U
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 cursor-pointer transition-colors ${
                activeFilter === filter
                  ? "bg-primary"
                  : "bg-border-dark hover:bg-surface-dark"
              }`}
            >
              <p
                className={`text-sm font-medium leading-normal ${
                  activeFilter === filter ? "text-white" : "text-text-muted"
                }`}
              >
                {filter}
              </p>
            </button>
          ))}
        </div>
      </header>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-surface-dark rounded-xl border border-border-dark p-4 hover:border-primary/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Checkbox */}
                <button
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    task.status === "completed"
                      ? "bg-green-500 border-green-500"
                      : "border-border-dark hover:border-primary"
                  }`}
                >
                  {task.status === "completed" && (
                    <span className="material-symbols-outlined text-white text-sm">
                      check
                    </span>
                  )}
                </button>

                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm font-bold ${
                      task.status === "completed"
                        ? "text-text-muted line-through"
                        : "text-white"
                    }`}
                  >
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`material-symbols-outlined ${task.sourceColor} text-sm`}>
                      {task.sourceIcon}
                    </span>
                    <span className="text-xs text-text-muted">{task.source}</span>
                  </div>
                </div>

                {/* Priority Badge */}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    task.priority === "high"
                      ? "bg-red-500/10 text-red-400"
                      : task.priority === "medium"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-border-dark text-text-muted"
                  }`}
                >
                  {task.priority.toUpperCase()}
                </span>

                {/* Due Date */}
                <span className="text-xs text-text-muted whitespace-nowrap">
                  {task.dueDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
