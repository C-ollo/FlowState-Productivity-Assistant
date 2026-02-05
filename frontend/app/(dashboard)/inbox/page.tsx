"use client";

import { Sparkles, MessageSquare, Mail, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Mock data
const briefingCards = [
  {
    title: "Today's Priorities",
    value: "3 Tasks",
    tags: ["Budget Approval", "Q1 Roadmap"],
    color: "text-primary",
  },
  {
    title: "Slack Threads",
    value: "2 Urgent",
    subtitle: "Require your immediate input",
    color: "text-warning",
  },
  {
    title: "Next Meeting",
    value: "In 24 mins",
    subtitle: "Design Sync w/ Platform Team",
    color: "text-text",
  },
];

const feedItems = [
  {
    id: 1,
    platform: "slack",
    title: "#product-design-system",
    priority: "HIGH PRIORITY",
    priorityColor: "bg-urgent",
    summary:
      "Sarah shared the final V2 components. Needs approval for the typography tokens by EOD to keep developer handoff on schedule.",
    time: "2m ago",
  },
  {
    id: 2,
    platform: "gmail",
    title: "Marcus Miller",
    priority: "READ LATER",
    priorityColor: "bg-primary",
    summary:
      "Monthly budget review for October. No major discrepancies found, but Marcus noted a 5% increase in AWS costs.",
    time: "14m ago",
  },
  {
    id: 3,
    platform: "slack",
    title: "Direct: Jordan Lee",
    priority: null,
    summary:
      "Jordan is asking if you have time for a quick 5-min huddle about the investor deck before the board meeting.",
    time: "45m ago",
  },
  {
    id: 4,
    platform: "gmail",
    title: "Calendar Invite: Weekly Standup",
    priority: "MEETING",
    priorityColor: "bg-calendar",
    summary:
      "Team weekly standup moved to 2pm. Agenda includes Q4 planning discussion and resource allocation review.",
    time: "1h ago",
  },
];

const sourceFilters = ["All Sources", "Gmail", "Slack"];

function PlatformIcon({ platform }: { platform: string }) {
  const iconClass = "h-5 w-5";
  switch (platform) {
    case "slack":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slack/10">
          <MessageSquare className={cn(iconClass, "text-slack")} />
        </div>
      );
    case "gmail":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gmail/10">
          <Mail className={cn(iconClass, "text-gmail")} />
        </div>
      );
    case "calendar":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-calendar/10">
          <Calendar className={cn(iconClass, "text-calendar")} />
        </div>
      );
    default:
      return null;
  }
}

export default function InboxPage() {
  const [activeFilter, setActiveFilter] = useState("All Sources");

  return (
    <div className="space-y-8">
      {/* Proactive Briefing Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text">Proactive Briefing</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs text-text-muted">
            <Sparkles className="h-3 w-3" />
            AI Generated
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {briefingCards.map((card, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <p className="text-sm text-primary mb-1">{card.title}</p>
              <p className={cn("text-2xl font-bold", card.color)}>{card.value}</p>
              {card.subtitle && (
                <p className="text-sm text-text-muted mt-1">{card.subtitle}</p>
              )}
              {card.tags && (
                <div className="flex gap-2 mt-3">
                  {card.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Unified Feed Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text">Unified Feed</h2>
          <div className="flex gap-1 rounded-lg bg-surface p-1">
            {sourceFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  activeFilter === filter
                    ? "bg-background text-text"
                    : "text-text-muted hover:text-text"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {feedItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl border border-border bg-surface p-4 hover:border-border-light transition-colors cursor-pointer"
            >
              <PlatformIcon platform={item.platform} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-text">{item.title}</h3>
                  {item.priority && (
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-medium text-white",
                        item.priorityColor
                      )}
                    >
                      {item.priority}
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary line-clamp-2">
                  <span className="text-primary">AI Summary:</span> {item.summary}
                </p>
              </div>
              <span className="text-xs text-text-muted whitespace-nowrap">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
