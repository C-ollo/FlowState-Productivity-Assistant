"use client";

import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useInboxItems, useInboxStats, useNextEvent } from "@/hooks/use-items";
import { useUser } from "@/hooks/use-auth";
import { useTodayBriefing, useGenerateBriefing } from "@/hooks/use-briefings";
import { useUpcomingDeadlines, useOverdueDeadlines } from "@/hooks/use-deadlines";
import { useTaskStats } from "@/hooks/use-tasks";
import { Item } from "@/types";

function getTimeAgo(date: string): string {
  const now = new Date();
  const received = new Date(date);
  const diffMs = now.getTime() - received.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getPlatformStyle(platform: string): { icon: string; bg: string } {
  switch (platform) {
    case "gmail":
      return { icon: "mail", bg: "bg-[#EA4335]" };
    case "slack":
      return { icon: "chat", bg: "bg-[#4A154B]" };
    case "calendar":
      return { icon: "calendar_month", bg: "bg-[#4285F4]" };
    default:
      return { icon: "inbox", bg: "bg-slate-600" };
  }
}

function getPriorityFlag(score: number): { label: string; flagColor: string; badgeColor: string } {
  if (score >= 80) {
    return { label: "High", flagColor: "text-red-400", badgeColor: "bg-red-500/10 text-red-400" };
  }
  if (score >= 60) {
    return { label: "Medium", flagColor: "text-orange-400", badgeColor: "bg-orange-500/10 text-orange-400" };
  }
  if (score >= 40) {
    return { label: "Normal", flagColor: "text-blue-400", badgeColor: "bg-blue-500/10 text-blue-400" };
  }
  return { label: "Low", flagColor: "text-slate-500", badgeColor: "bg-slate-500/10 text-slate-400" };
}

function getActionLabel(actionType: string): string | null {
  switch (actionType) {
    case "reply_needed":
      return "Reply needed";
    case "review_needed":
      return "Review needed";
    case "meeting_request":
      return "Meeting request";
    case "task_assigned":
      return "Task assigned";
    default:
      return null;
  }
}

function splitBriefingSections(content: string): { title: string; body: string }[] {
  const sections: { title: string; body: string }[] = [];
  const parts = content.split(/^## /m);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const newlineIdx = trimmed.indexOf("\n");
    if (newlineIdx === -1) {
      sections.push({ title: trimmed, body: "" });
    } else {
      sections.push({
        title: trimmed.substring(0, newlineIdx).trim(),
        body: trimmed.substring(newlineIdx + 1).trim(),
      });
    }
  }

  return sections;
}

function getTimeUntil(dateStr: string): string {
  const now = new Date();
  const target = new Date(dateStr);
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) return "Now";

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 60) return `In ${diffMins} min`;
  if (diffHours < 24) {
    const remainMins = diffMins % 60;
    return remainMins > 0
      ? `In ${diffHours}h ${remainMins}m`
      : `In ${diffHours}h`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `In ${diffDays}d`;
}

const sourceFilters = ["All Sources", "Gmail", "Slack", "Calendar"];

export default function DashboardPage() {
  const { data: user } = useUser();
  const { data: itemsData } = useInboxItems({ is_archived: false, page_size: 10 });
  const { data: stats } = useInboxStats();
  const { data: briefing, isLoading: briefingLoading } = useTodayBriefing();
  const generateBriefing = useGenerateBriefing();
  const { data: upcomingDeadlines } = useUpcomingDeadlines(7);
  const { data: overdueDeadlines } = useOverdueDeadlines();
  const { data: taskStats } = useTaskStats();
  const { data: nextEvent } = useNextEvent();
  const [activeSource, setActiveSource] = useState("All Sources");

  const recentItems = itemsData?.items || [];
  const actionRequiredItems = recentItems.filter((item: Item) => item.action_required);
  const topPriorities = [...actionRequiredItems]
    .sort((a: Item, b: Item) => b.priority_score - a.priority_score)
    .slice(0, 3);

  const filteredItems = recentItems
    .filter((item: Item) => {
      if (activeSource === "All Sources") return true;
      return item.platform === activeSource.toLowerCase();
    })
    .sort((a: Item, b: Item) => b.priority_score - a.priority_score);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  const greeting = getGreeting();
  const overdueCount = overdueDeadlines?.length || 0;
  const upcomingCount = upcomingDeadlines?.length || 0;

  return (
    <>
      {/* Header */}
      <header className="border-b border-border-dark px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {greeting}, {user?.name?.split(" ")[0] || "there"}
          </h2>
          <p className="text-sm text-text-muted">
            Here&apos;s your productivity overview for today
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 bg-border-dark rounded-lg text-text-muted hover:text-white transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* Proactive Briefing Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold tracking-tight">Proactive Briefing</h3>
            <span className="flex items-center gap-1.5 bg-surface-dark border border-border-dark rounded-lg px-3 py-1 text-xs text-text-muted">
              <span className="material-symbols-outlined text-sm text-primary">
                auto_awesome
              </span>
              AI Generated
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Next Meeting Tile */}
            <div className="p-5 rounded-xl border border-border-dark bg-surface-dark">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-base text-[#4285F4]">
                  calendar_month
                </span>
                <p className="text-sm font-medium text-text-muted">Next Meeting</p>
              </div>
              {nextEvent?.event_start ? (
                <>
                  <p className="text-2xl font-bold text-[#4285F4]">
                    {getTimeUntil(nextEvent.event_start)}
                  </p>
                  <p className="text-xs text-text-muted mt-1 truncate">
                    {nextEvent.subject || "Untitled event"}
                  </p>
                  {nextEvent.event_location && (
                    <p className="text-[10px] text-text-muted mt-0.5 truncate flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">location_on</span>
                      {nextEvent.event_location}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-green-400">All Clear</p>
                  <p className="text-xs text-text-muted mt-1">No upcoming meetings</p>
                </>
              )}
            </div>

            {/* Today's Priorities Tile */}
            <div className="p-5 rounded-xl border border-primary/20 bg-primary/5">
              <p className="text-sm font-medium text-primary mb-1">Today&apos;s Priorities</p>
              <p className="text-2xl font-bold">
                {actionRequiredItems.length} {actionRequiredItems.length === 1 ? "Item" : "Items"}
              </p>
              {topPriorities.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {topPriorities.map((item: Item) => (
                    <span
                      key={item.id}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold truncate max-w-[140px]"
                    >
                      {item.subject || item.sender_name || "Untitled"}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Deadlines Tile */}
            <Link
              href="/deadlines"
              className="group p-5 rounded-xl border border-border-dark bg-surface-dark hover:border-amber-400/40 hover:bg-amber-400/[0.03] transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-text-muted">Deadlines</p>
                <span className="material-symbols-outlined text-text-muted text-base opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  arrow_forward
                </span>
              </div>
              {overdueCount > 0 ? (
                <p className="text-2xl font-bold text-red-400">{overdueCount} Overdue</p>
              ) : (
                <p className="text-2xl font-bold text-green-400">All Clear</p>
              )}
              <p className="text-xs text-text-muted mt-1">
                {upcomingCount} upcoming this week
              </p>
            </Link>

            {/* Tasks Tile */}
            <Link
              href="/tasks"
              className="group p-5 rounded-xl border border-border-dark bg-surface-dark hover:border-blue-400/40 hover:bg-blue-400/[0.03] transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-text-muted">Open Tasks</p>
                <span className="material-symbols-outlined text-text-muted text-base opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  arrow_forward
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {(taskStats?.by_status?.todo || 0) + (taskStats?.by_status?.in_progress || 0)}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {taskStats?.by_status?.done || 0} completed
              </p>
            </Link>
          </div>
        </section>

        {/* AI Briefing Content */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Today&apos;s Briefing</h3>
          </div>
          {briefing ? (
            <div className="space-y-3">
              {/* Summary bar */}
              <div className="flex items-center gap-2 px-1">
                <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
                <p className="text-xs font-semibold text-primary tracking-wide uppercase">AI Daily Summary</p>
                <span className="ml-auto text-[10px] text-text-muted">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </span>
              </div>
              {/* Section tiles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {splitBriefingSections(briefing.content).map((section, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border-dark bg-surface-dark p-4 flex flex-col"
                  >
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 rounded-full bg-primary shrink-0"></span>
                      {section.title}
                    </h4>
                    {section.body && (
                      <div className="flex-1">
                        <ReactMarkdown
                          components={{
                            h3: ({ children }) => (
                              <h5 className="text-xs font-bold text-primary mt-2 mb-1 first:mt-0">{children}</h5>
                            ),
                            ul: ({ children }) => (
                              <ul className="space-y-1.5 mb-2">{children}</ul>
                            ),
                            li: ({ children }) => (
                              <li className="flex items-start gap-1.5 text-xs text-text-muted leading-relaxed">
                                <span className="text-primary mt-0.5 shrink-0">&#8226;</span>
                                <span className="flex-1">{children}</span>
                              </li>
                            ),
                            p: ({ children }) => (
                              <p className="text-xs text-text-muted mb-2 leading-relaxed last:mb-0">{children}</p>
                            ),
                            strong: ({ children }) => (
                              <strong className="text-white font-semibold">{children}</strong>
                            ),
                            em: ({ children }) => (
                              <em className="text-amber-400 not-italic font-medium">{children}</em>
                            ),
                          }}
                        >
                          {section.body}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border-dark bg-surface-dark p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-text-muted mb-2">
                auto_awesome
              </span>
              <p className="text-text-muted">No briefing for today yet</p>
              <p className="text-sm text-text-muted mt-1 mb-4">
                {briefingLoading ? "Loading..." : "Generate your AI daily briefing based on your inbox, deadlines, and tasks"}
              </p>
              <button
                onClick={() => generateBriefing.mutate()}
                disabled={generateBriefing.isPending || briefingLoading}
                className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">
                  {generateBriefing.isPending ? "hourglass_top" : "auto_awesome"}
                </span>
                {generateBriefing.isPending ? "Generating..." : "Generate Today's Briefing"}
              </button>
              {generateBriefing.isError && (
                <p className="text-xs text-red-400 mt-2">
                  Failed to generate briefing. Make sure you have synced items first.
                </p>
              )}
            </div>
          )}
        </section>

        {/* Unified Feed */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold tracking-tight">Unified Feed</h3>
            <div className="flex gap-2">
              {sourceFilters.map((source) => (
                <button
                  key={source}
                  onClick={() => setActiveSource(source)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                    activeSource === source
                      ? "bg-border-dark text-white"
                      : "text-text-muted hover:bg-border-dark"
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item: Item) => {
                const platform = getPlatformStyle(item.platform);
                const priority = getPriorityFlag(item.priority_score);
                const action = getActionLabel(item.action_type);
                const displayName =
                  item.channel_name
                    ? `#${item.channel_name}`
                    : item.sender_name || item.sender_email || item.subject || "Unknown";

                return (
                  <div
                    key={item.id}
                    className="group p-4 rounded-xl border border-border-dark bg-surface-dark hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <div className="flex gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg ${platform.bg} flex items-center justify-center shrink-0`}
                      >
                        <span className="material-symbols-outlined text-white text-xl">
                          {platform.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`material-symbols-outlined text-sm shrink-0 ${priority.flagColor}`}>
                              flag
                            </span>
                            <h4 className="font-bold text-sm truncate">{displayName}</h4>
                            {!item.is_read && (
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                            )}
                            <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${priority.badgeColor}`}>
                              {priority.label}
                            </span>
                            {action && (
                              <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400">
                                {action}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-text-muted whitespace-nowrap ml-3">
                            {getTimeAgo(item.received_at)}
                          </span>
                        </div>
                        {item.ai_summary ? (
                          <p className="text-sm text-text-muted line-clamp-2">
                            <span className="text-primary font-semibold">AI Summary: </span>
                            {item.ai_summary}
                          </p>
                        ) : (
                          <p className="text-sm text-text-muted truncate">
                            {item.subject || item.snippet || "No content"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-surface-dark rounded-xl border border-border-dark p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-text-muted mb-2">
                  inbox
                </span>
                <p className="text-text-muted">No messages yet</p>
                <p className="text-sm text-text-muted mt-1">
                  Connect your accounts and sync to see your messages
                </p>
              </div>
            )}
            {filteredItems.length > 0 && (
              <div className="flex justify-center pt-2">
                <Link
                  href="/inbox"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  View all messages
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
