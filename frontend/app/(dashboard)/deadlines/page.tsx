"use client";

import { useState } from "react";
import { useDeadlines, useUpcomingDeadlines, useOverdueDeadlines } from "@/hooks/use-deadlines";
import { useUser } from "@/hooks/use-auth";
import { Deadline } from "@/types";

const categoryFilters = ["All", "Work", "School", "Personal"];

function formatDeadline(date: string): string {
  const deadline = new Date(date);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays === 0) return "Earlier today";
    if (absDays === 1) return "Yesterday";
    return `${absDays} days ago`;
  }

  if (diffHours < 1) return "Less than 1 hour";
  if (diffHours < 24) return `In ${diffHours} hours`;
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;

  return deadline.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short"
  });
}

function isToday(date: string): boolean {
  const d = new Date(date);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isThisWeek(date: string): boolean {
  const d = new Date(date);
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return d > now && d <= weekFromNow;
}

function isOverdue(date: string): boolean {
  return new Date(date) < new Date();
}

function DeadlineCard({ deadline }: { deadline: Deadline }) {
  const overdue = isOverdue(deadline.due_at);
  const today = !overdue && isToday(deadline.due_at);

  return (
    <div
      className={`bg-surface-dark rounded-xl border border-border-dark p-4 shadow-lg group hover:border-primary/50 transition-all cursor-pointer ${
        overdue ? "border-l-4 border-l-red-500" : today ? "border-l-4 border-l-amber-400" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="material-symbols-outlined text-amber-400 text-xl">
          timer
        </span>
        {deadline.confidence >= 0.9 && (
          <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-bold">
            HIGH CONFIDENCE
          </span>
        )}
        {overdue && (
          <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold">
            OVERDUE
          </span>
        )}
      </div>
      <h4 className="text-sm font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
        {deadline.title}
      </h4>
      {deadline.source_text && (
        <p className="text-xs text-text-muted mb-3 line-clamp-2">
          "{deadline.source_text}"
        </p>
      )}
      <div className="flex items-center justify-between border-t border-border-dark pt-3 mt-1">
        <div className="flex flex-col">
          <p className="text-[10px] uppercase text-text-muted font-bold">
            Due Date
          </p>
          <p className={`text-xs font-medium ${
            overdue ? "text-red-400" : today ? "text-amber-400" : "text-white"
          }`}>
            {formatDeadline(deadline.due_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="text-[11px] text-text-muted hover:text-white py-1.5 px-3 rounded-lg border border-border-dark hover:border-primary transition-colors">
            Dismiss
          </button>
          <button className="bg-primary text-white text-[11px] font-bold py-1.5 px-3 rounded-lg hover:bg-blue-600 transition-colors">
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DeadlinesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"kanban" | "timeline">("kanban");
  const { data: user } = useUser();

  const { data: overdueData } = useOverdueDeadlines();
  const { data: upcomingData } = useUpcomingDeadlines(30);

  const overdueDeadlines = overdueData || [];
  const allUpcoming = upcomingData || [];

  // Split upcoming into today and this week
  const todayDeadlines = allUpcoming.filter(
    (d: Deadline) => isToday(d.due_at) && !isOverdue(d.due_at)
  );
  const thisWeekDeadlines = allUpcoming.filter(
    (d: Deadline) => !isToday(d.due_at) && isThisWeek(d.due_at)
  );
  const laterDeadlines = allUpcoming.filter(
    (d: Deadline) => !isToday(d.due_at) && !isThisWeek(d.due_at) && !isOverdue(d.due_at)
  );

  return (
    <>
      {/* Header Section */}
      <header className="border-b border-border-dark px-8 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold tracking-tight">
              Deadlines & Action Items
            </h2>
            <div className="relative flex items-center bg-border-dark rounded-lg p-1">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                  viewMode === "kanban"
                    ? "bg-surface-dark shadow-sm"
                    : "text-text-muted"
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                  viewMode === "timeline"
                    ? "bg-surface-dark shadow-sm"
                    : "text-text-muted"
                }`}
              >
                Timeline
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">
                search
              </span>
              <input
                className="w-full bg-border-dark border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary placeholder:text-text-muted"
                placeholder="Search deadlines..."
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
          {categoryFilters.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 cursor-pointer transition-colors ${
                activeCategory === category
                  ? "bg-primary"
                  : "bg-border-dark hover:bg-surface-dark"
              }`}
            >
              <p
                className={`text-sm font-medium leading-normal ${
                  activeCategory === category ? "text-white" : "text-text-muted"
                }`}
              >
                {category}
              </p>
            </button>
          ))}
          <div className="h-4 w-px bg-border-dark mx-2"></div>
          <span className="text-xs text-text-muted flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-primary">auto_awesome</span>
            AI-extracted from your messages
          </span>
        </div>
      </header>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto bg-[#0a0d14] p-6">
        <div className="flex h-full gap-6 min-w-max">
          {/* Overdue Column */}
          <div className="flex flex-col w-80 gap-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                Overdue
                <span className="ml-1 text-xs px-2 py-0.5 rounded bg-red-400/10 border border-red-400/20">
                  {overdueDeadlines.length}
                </span>
              </h3>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
              {overdueDeadlines.length > 0 ? (
                overdueDeadlines.map((deadline: Deadline) => (
                  <DeadlineCard key={deadline.id} deadline={deadline} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-dark rounded-xl text-center">
                  <span className="material-symbols-outlined text-green-400 text-3xl mb-2">
                    check_circle
                  </span>
                  <p className="text-xs text-text-muted">No overdue items!</p>
                </div>
              )}
            </div>
          </div>

          {/* Due Today Column */}
          <div className="flex flex-col w-80 gap-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-400">
                Due Today
                <span className="ml-1 text-xs px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                  {todayDeadlines.length}
                </span>
              </h3>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
              {todayDeadlines.length > 0 ? (
                todayDeadlines.map((deadline: Deadline) => (
                  <DeadlineCard key={deadline.id} deadline={deadline} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-dark rounded-xl text-center">
                  <span className="material-symbols-outlined text-text-muted text-3xl mb-2">
                    event_available
                  </span>
                  <p className="text-xs text-text-muted">Nothing due today</p>
                </div>
              )}
            </div>
          </div>

          {/* Due This Week Column */}
          <div className="flex flex-col w-80 gap-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
                Due This Week
                <span className="ml-1 text-xs px-2 py-0.5 rounded bg-border-dark">
                  {thisWeekDeadlines.length}
                </span>
              </h3>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
              {thisWeekDeadlines.length > 0 ? (
                thisWeekDeadlines.map((deadline: Deadline) => (
                  <DeadlineCard key={deadline.id} deadline={deadline} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-dark rounded-xl text-center">
                  <span className="material-symbols-outlined text-text-muted text-3xl mb-2">
                    event_available
                  </span>
                  <p className="text-xs text-text-muted">Nothing due this week</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Column */}
          <div className="flex flex-col w-80 gap-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
                Upcoming
                <span className="ml-1 text-xs px-2 py-0.5 rounded bg-border-dark">
                  {laterDeadlines.length}
                </span>
              </h3>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
              {laterDeadlines.length > 0 ? (
                laterDeadlines.map((deadline: Deadline) => (
                  <DeadlineCard key={deadline.id} deadline={deadline} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-dark rounded-xl text-center">
                  <span className="material-symbols-outlined text-border-dark text-4xl mb-2">
                    event_available
                  </span>
                  <p className="text-xs text-text-muted">
                    Items for later will appear here as they are detected.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
