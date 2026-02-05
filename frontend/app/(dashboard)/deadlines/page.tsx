"use client";

import { useState } from "react";
import { Mail, MessageSquare, Calendar, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryFilters = ["All", "Work", "School", "Personal"];

const overdueItems = [
  {
    id: 1,
    platform: "gmail",
    title: "Fix CSS bug in production dashboard",
    sender: "Sarah Chen",
    tag: "#project-alpha",
    badge: "URGENT",
    badgeColor: "text-urgent",
    deadline: "Yesterday, 5:00 PM",
    deadlineLabel: "EXTRACTED DEADLINE",
  },
  {
    id: 2,
    platform: "gmail",
    title: "Q3 Review Feedback and Action Items",
    sender: "Mark Peters",
    tag: "HR",
    badge: null,
    deadline: "Oct 12th",
    deadlineLabel: "EXTRACTED DEADLINE",
  },
];

const dueTodayItems = [
  {
    id: 3,
    platform: "calendar",
    title: "Weekly Sync: Design Operations",
    sender: "Internal",
    tag: "Calendar",
    badge: "MEETING",
    badgeColor: "text-calendar",
    deadline: "In 2 hours",
    deadlineLabel: "TIME REMAINING",
  },
  {
    id: 4,
    platform: "gmail",
    title: "Review draft proposal for client X",
    sender: "Linda Wu",
    tag: "#client-work",
    badge: null,
    deadline: "Today, 6:00 PM",
    deadlineLabel: "EXTRACTED DEADLINE",
  },
];

function PlatformIcon({ platform }: { platform: string }) {
  const iconClass = "h-4 w-4";
  switch (platform) {
    case "slack":
      return <MessageSquare className={cn(iconClass, "text-slack")} />;
    case "gmail":
      return <Mail className={cn(iconClass, "text-gmail")} />;
    case "calendar":
      return <Calendar className={cn(iconClass, "text-calendar")} />;
    default:
      return null;
  }
}

interface DeadlineCardProps {
  item: {
    id: number;
    platform: string;
    title: string;
    sender: string;
    tag: string;
    badge: string | null;
    badgeColor?: string;
    deadline: string;
    deadlineLabel: string;
  };
}

function DeadlineCard({ item }: DeadlineCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 hover:border-border-light transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <PlatformIcon platform={item.platform} />
          {item.badge && (
            <span className={cn("text-xs font-medium", item.badgeColor)}>
              {item.badge}
            </span>
          )}
        </div>
      </div>

      <h3 className="font-medium text-text mb-2 line-clamp-2">{item.title}</h3>

      <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <div className="h-5 w-5 rounded-full bg-surface-hover flex items-center justify-center text-xs">
          {item.sender[0]}
        </div>
        <span>{item.sender}</span>
        <span>•</span>
        <span>{item.tag}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wide">
            {item.deadlineLabel}
          </p>
          <p
            className={cn(
              "text-sm font-medium",
              item.deadlineLabel === "TIME REMAINING"
                ? "text-success"
                : "text-urgent"
            )}
          >
            {item.deadline}
          </p>
        </div>
        <button className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">
            Deadlines & Action Items
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-lg bg-surface p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "kanban"
                  ? "bg-background text-text"
                  : "text-text-muted hover:text-text"
              )}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "timeline"
                  ? "bg-background text-text"
                  : "text-text-muted hover:text-text"
              )}
            >
              Timeline
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search deadlines..."
              className="w-48 rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          {categoryFilters.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeCategory === category
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary hover:bg-surface-hover"
              )}
            >
              {category}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:border-border-light hover:text-text transition-colors">
          <Filter className="h-4 w-4" />
          Filter by Platform
        </button>
      </div>

      {/* Deadline Columns */}
      <div className="grid grid-cols-2 gap-6">
        {/* Overdue Column */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-urgent" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-urgent">
              Overdue
            </h2>
            <span className="text-sm text-text-muted">{overdueItems.length}</span>
          </div>
          <div className="space-y-3">
            {overdueItems.map((item) => (
              <DeadlineCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Due Today Column */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-success" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-success">
              Due Today
            </h2>
            <span className="text-sm text-text-muted">{dueTodayItems.length}</span>
          </div>
          <div className="space-y-3">
            {dueTodayItems.map((item) => (
              <DeadlineCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
