"use client";

import { useState } from "react";

const categoryFilters = ["All", "Work", "School", "Personal"];

const overdueItems = [
  {
    id: 1,
    platform: "slack",
    icon: "alternate_email",
    iconColor: "text-slack",
    title: "Fix CSS bug in production dashboard",
    sender: "Sarah Chen",
    tag: "#project-alpha",
    badge: "URGENT",
    badgeColor: "bg-red-500/10 text-red-400",
    deadline: "Yesterday, 5:00 PM",
    deadlineColor: "text-red-400",
    deadlineLabel: "Extracted Deadline",
    hasBorderAccent: true,
  },
  {
    id: 2,
    platform: "gmail",
    icon: "mail",
    iconColor: "text-gmail",
    title: "Q3 Review Feedback and Action Items",
    sender: "Mark Peters",
    tag: "HR",
    badge: null,
    deadline: "Oct 12th",
    deadlineColor: "text-red-400",
    deadlineLabel: "Extracted Deadline",
    hasBorderAccent: false,
  },
];

const dueTodayItems = [
  {
    id: 3,
    platform: "calendar",
    icon: "calendar_month",
    iconColor: "text-calendar",
    title: "Weekly Sync: Design Operations",
    sender: "Internal",
    tag: "Calendar",
    badge: "MEETING",
    badgeColor: "bg-primary/10 text-primary",
    deadline: "In 2 hours",
    deadlineColor: "text-amber-400",
    deadlineLabel: "Time Remaining",
    hasBorderAccent: false,
  },
  {
    id: 4,
    platform: "slack",
    icon: "alternate_email",
    iconColor: "text-slack",
    title: "Review draft proposal for client X",
    sender: "Linda Wu",
    tag: "#client-work",
    badge: null,
    deadline: "Today, 6:00 PM",
    deadlineColor: "text-white",
    deadlineLabel: "Extracted Deadline",
    hasBorderAccent: false,
  },
];

const dueThisWeekItems = [
  {
    id: 5,
    platform: "gmail",
    icon: "mail",
    iconColor: "text-gmail",
    title: "Flight Confirmation: SF to NY",
    sender: "United Airlines",
    tag: "Personal",
    badge: null,
    deadline: "Thursday, 8:00 AM",
    deadlineColor: "text-white",
    deadlineLabel: "Extracted Deadline",
    hasBorderAccent: false,
  },
];

interface DeadlineItem {
  id: number;
  platform: string;
  icon: string;
  iconColor: string;
  title: string;
  sender: string;
  tag: string;
  badge: string | null;
  badgeColor?: string;
  deadline: string;
  deadlineColor: string;
  deadlineLabel: string;
  hasBorderAccent: boolean;
}

function DeadlineCard({ item }: { item: DeadlineItem }) {
  return (
    <div
      className={`bg-surface-dark rounded-xl border border-border-dark p-4 shadow-lg group hover:border-primary/50 transition-all cursor-pointer ${
        item.hasBorderAccent ? "border-l-4 border-l-red-500" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`material-symbols-outlined ${item.iconColor} text-xl`}>
          {item.icon}
        </span>
        {item.badge && (
          <span className={`text-[10px] ${item.badgeColor} px-2 py-0.5 rounded font-bold`}>
            {item.badge}
          </span>
        )}
      </div>
      <h4 className="text-sm font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
        {item.title}
      </h4>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-border-dark flex items-center justify-center text-[10px] text-text-muted">
          {item.sender[0]}
        </div>
        <p className="text-xs text-text-muted">
          {item.sender} <span className="mx-1">•</span> {item.tag}
        </p>
      </div>
      <div className="flex items-center justify-between border-t border-border-dark pt-3 mt-1">
        <div className="flex flex-col">
          <p className="text-[10px] uppercase text-text-muted font-bold">
            {item.deadlineLabel}
          </p>
          <p className={`text-xs ${item.deadlineColor} font-medium`}>
            {item.deadline}
          </p>
        </div>
        <button className="bg-primary text-white text-[11px] font-bold py-1.5 px-3 rounded-lg hover:bg-blue-600 transition-colors">
          Create Task
        </button>
      </div>
    </div>
  );
}

export default function DeadlinesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"kanban" | "timeline">("kanban");

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
              U
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
          <button className="text-xs text-text-muted flex items-center gap-1 hover:text-white">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Filter by Platform
          </button>
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
                  {overdueItems.length}
                </span>
              </h3>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
              {overdueItems.map((item) => (
                <DeadlineCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Due Today Column */}
          <div className="flex flex-col w-80 gap-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-400">
                Due Today
                <span className="ml-1 text-xs px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                  {dueTodayItems.length}
                </span>
              </h3>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
              {dueTodayItems.map((item) => (
                <DeadlineCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Due This Week Column */}
          <div className="flex flex-col w-80 gap-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
                Due This Week
                <span className="ml-1 text-xs px-2 py-0.5 rounded bg-border-dark">
                  {dueThisWeekItems.length}
                </span>
              </h3>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
              {dueThisWeekItems.map((item) => (
                <DeadlineCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Upcoming Column */}
          <div className="flex flex-col w-80 gap-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
                Upcoming
                <span className="ml-1 text-xs px-2 py-0.5 rounded bg-border-dark">
                  12
                </span>
              </h3>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-dark rounded-xl text-center">
                <span className="material-symbols-outlined text-border-dark text-4xl mb-2">
                  event_available
                </span>
                <p className="text-xs text-text-muted">
                  Items for next week will appear here as they are detected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
