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

function getPlatformIcon(platform: string): string {
  switch (platform) {
    case "gmail":
      return "mail";
    case "slack":
      return "chat_bubble";
    case "calendar":
      return "calendar_month";
    default:
      return "inbox";
  }
}

function getPriorityBadge(score: number): {
  label: string;
  badgeClass: string;
} {
  if (score >= 80) {
    return {
      label: "CRITICAL",
      badgeClass:
        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    };
  }
  if (score >= 60) {
    return {
      label: "URGENT",
      badgeClass:
        "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    };
  }
  if (score >= 40) {
    return {
      label: "PENDING",
      badgeClass:
        "bg-slate-800 text-slate-400 border border-slate-700",
    };
  }
  return {
    label: "FYI",
    badgeClass:
      "bg-slate-800 text-slate-500 border border-slate-700",
  };
}

function getTimeUntil(dateStr: string): string {
  const now = new Date();
  const target = new Date(dateStr);
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) return "Now";

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 60) return `in ${diffMins} min`;
  if (diffHours < 24) {
    const remainMins = diffMins % 60;
    return remainMins > 0 ? `in ${diffHours}h ${remainMins}m` : `in ${diffHours}h`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `in ${diffDays}d`;
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

const sourceFilters = [
  { label: "Priority", key: "priority" },
  { label: "Recent", key: "recent" },
  { label: "All", key: "all" },
];

export default function DashboardPage() {
  const { data: user } = useUser();
  const { data: itemsData } = useInboxItems({ is_archived: false, page_size: 20 });
  const { data: stats } = useInboxStats();
  const { data: briefing, isLoading: briefingLoading } = useTodayBriefing();
  const generateBriefing = useGenerateBriefing();
  const { data: upcomingDeadlines } = useUpcomingDeadlines(7);
  const { data: overdueDeadlines } = useOverdueDeadlines();
  const { data: taskStats } = useTaskStats();
  const { data: nextEvent } = useNextEvent();
  const [feedSort, setFeedSort] = useState("priority");

  const recentItems = itemsData?.items || [];
  const actionRequiredItems = recentItems.filter((item: Item) => item.action_required);
  const highPriorityCount = recentItems.filter((item: Item) => item.priority_score >= 80).length;

  // Priority items first (score >= 60), then the rest by recency
  const priorityItems = [...recentItems]
    .filter((item: Item) => item.priority_score >= 60)
    .sort((a: Item, b: Item) => b.priority_score - a.priority_score);
  const otherItems = [...recentItems]
    .filter((item: Item) => item.priority_score < 60)
    .sort(
      (a: Item, b: Item) =>
        new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
    );
  const feedItems = [...priorityItems, ...otherItems].slice(0, 5);

  const overdueCount = overdueDeadlines?.length || 0;
  const upcomingCount = upcomingDeadlines?.length || 0;
  const openTasks =
    (taskStats?.by_status?.todo || 0) + (taskStats?.by_status?.in_progress || 0);
  const unreadCount = stats?.unread_count ?? 0;

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  // Get the top briefing insight for the hero card
  const briefingSections = briefing ? splitBriefingSections(briefing.content) : [];
  const heroSection = briefingSections[0];
  const secondarySections = briefingSections.slice(1, 3);

  return (
    <main className="flex-1 h-screen overflow-y-auto relative bg-background-dark">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-background-dark/80 backdrop-blur-md border-b border-slate-800/50 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {getGreeting()}, {user?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-sm text-slate-400 hidden sm:block">
            {highPriorityCount > 0
              ? `You have ${highPriorityCount} high priority item${highPriorityCount !== 1 ? "s" : ""} requiring attention.`
              : "Here\u2019s your productivity overview for today."}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
              search
            </span>
            <input
              className="pl-10 pr-16 py-2 w-64 lg:w-96 rounded-full bg-surface-dark border border-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-white placeholder-slate-400"
              placeholder="Ask AI to find anything..."
              type="text"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-xs text-slate-500 border border-slate-600 rounded px-1.5 py-0.5">
                &#8984;K
              </span>
            </div>
          </div>
          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">notifications_none</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background-dark" />
            )}
          </button>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Daily Briefing Hero Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
            <h2 className="text-lg font-semibold text-white">Daily Briefing</h2>
          </div>

          {briefing ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Hero Card */}
              <div className="lg:col-span-2 relative group rounded-xl overflow-hidden bg-surface-dark ai-border shadow-lg">
                <div className="relative z-10 p-6 sm:p-8 flex flex-col h-full justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      AI Briefing
                    </div>
                    {heroSection && (
                      <>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
                          {heroSection.title}
                        </h3>
                        <div className="text-slate-300 text-base max-w-lg mb-6 leading-relaxed line-clamp-3">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p>{children}</p>,
                              strong: ({ children }) => (
                                <strong className="text-white font-semibold">{children}</strong>
                              ),
                              ul: ({ children }) => <span>{children}</span>,
                              li: ({ children }) => <span>{children} </span>,
                            }}
                          >
                            {heroSection.body.split("\n").slice(0, 3).join("\n")}
                          </ReactMarkdown>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/inbox"
                      className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition-all shadow-lg shadow-primary/25 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">bolt</span>
                      View Inbox
                    </Link>
                    <Link
                      href="/tasks"
                      className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium transition-all backdrop-blur-sm"
                    >
                      View Tasks
                    </Link>
                  </div>
                </div>
              </div>

              {/* Secondary Insight Cards */}
              <div className="flex flex-col gap-4">
                {secondarySections.map((section, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-surface-dark rounded-xl p-5 border border-slate-800 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-lg">
                          {idx === 0 ? "trending_up" : "insights"}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">AI Summary</span>
                    </div>
                    <h4 className="font-semibold text-slate-100 mb-1">{section.title}</h4>
                    <div className="text-sm text-slate-400 line-clamp-2">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p>{children}</p>,
                          strong: ({ children }) => (
                            <strong className="text-white">{children}</strong>
                          ),
                          ul: ({ children }) => <span>{children}</span>,
                          li: ({ children }) => <span>{children} </span>,
                        }}
                      >
                        {section.body.split("\n").slice(0, 2).join("\n")}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                {secondarySections.length === 0 && (
                  <div className="flex-1 bg-surface-dark rounded-xl p-5 border border-slate-800 flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-3xl text-slate-600 mb-2">
                      auto_awesome
                    </span>
                    <p className="text-sm text-slate-400">More insights will appear here</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-surface-dark ai-border p-8 text-center shadow-lg">
              <span className="material-symbols-outlined text-4xl text-slate-500 mb-3 block">
                auto_awesome
              </span>
              <p className="text-white font-semibold mb-1">No briefing for today yet</p>
              <p className="text-sm text-slate-400 mb-5">
                {briefingLoading
                  ? "Loading..."
                  : "Generate your AI daily briefing based on your inbox, deadlines, and tasks"}
              </p>
              <button
                onClick={() => generateBriefing.mutate()}
                disabled={generateBriefing.isPending || briefingLoading}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">
                  {generateBriefing.isPending ? "hourglass_top" : "auto_awesome"}
                </span>
                {generateBriefing.isPending ? "Generating..." : "Generate Today\u2019s Briefing"}
              </button>
              {generateBriefing.isError && (
                <p className="text-xs text-red-400 mt-3">
                  Failed to generate briefing. Make sure you have synced items first.
                </p>
              )}
            </div>
          )}
        </section>

        {/* Priority Stat Tiles */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Next Meeting */}
            <div className="bg-surface-dark rounded-xl p-4 border-l-4 border-primary shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Next Meeting
                </p>
                {nextEvent?.event_start ? (
                  <>
                    <h3 className="text-xl font-bold text-white mt-1">
                      {new Date(nextEvent.event_start).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </h3>
                    <p className="text-sm text-primary mt-0.5 font-medium">
                      {getTimeUntil(nextEvent.event_start)}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-white mt-1">All Clear</h3>
                    <p className="text-sm text-emerald-500 mt-0.5 font-medium">No meetings</p>
                  </>
                )}
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">videocam</span>
              </div>
            </div>

            {/* Overdue */}
            <div className="bg-surface-dark rounded-xl p-4 border-l-4 border-red-500 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Overdue
                </p>
                <h3 className="text-xl font-bold text-white mt-1">
                  {overdueCount} {overdueCount === 1 ? "Task" : "Tasks"}
                </h3>
                <p className="text-sm text-red-500 mt-0.5 font-medium">
                  {overdueCount > 0 ? "Requires Action" : "All clear"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <span className="material-symbols-outlined">assignment_late</span>
              </div>
            </div>

            {/* Open Tasks */}
            <Link
              href="/tasks"
              className="bg-surface-dark rounded-xl p-4 border-l-4 border-amber-500 shadow-sm flex items-center justify-between hover:bg-surface-darker transition-colors"
            >
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Open Tasks
                </p>
                <h3 className="text-xl font-bold text-white mt-1">
                  {openTasks} {openTasks === 1 ? "Item" : "Items"}
                </h3>
                <p className="text-sm text-amber-500 mt-0.5 font-medium">
                  {taskStats?.by_status?.done || 0} completed
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <span className="material-symbols-outlined">rate_review</span>
              </div>
            </Link>

            {/* Deadlines */}
            <Link
              href="/deadlines"
              className="bg-surface-dark rounded-xl p-4 border-l-4 border-emerald-500 shadow-sm flex items-center justify-between hover:bg-surface-darker transition-colors"
            >
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Deadlines
                </p>
                <h3 className="text-xl font-bold text-white mt-1">
                  {upcomingCount} Upcoming
                </h3>
                <p className="text-sm text-emerald-500 mt-0.5 font-medium">This week</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Unified Intelligence Feed */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Unified Intelligence Feed
            </h2>
            <div className="flex gap-1 bg-surface-dark p-1 rounded-xl border border-slate-700/50">
              {sourceFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFeedSort(f.key)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    feedSort === f.key
                      ? "bg-slate-700 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {feedItems.length > 0 ? (
              feedItems.map((item: Item) => {
                const icon = getPlatformIcon(item.platform);
                const priority = getPriorityBadge(item.priority_score);
                const displayName = item.channel_name
                  ? `#${item.channel_name}`
                  : item.sender_name || item.sender_email || "Unknown";

                return (
                  <div
                    key={item.id}
                    className="group relative p-5 rounded-2xl border border-slate-800 bg-surface-dark/40 hover:bg-slate-800/40 hover:border-primary/40 transition-all cursor-pointer"
                  >
                    <div className="flex gap-5">
                      {/* Platform Icon Tile */}
                      <div className="w-12 h-12 rounded-xl bg-background-dark flex items-center justify-center shrink-0 border border-slate-800 group-hover:border-primary/30 transition-colors">
                        <span className="material-symbols-outlined text-white text-2xl opacity-80">
                          {icon}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <h3 className="font-bold text-sm text-white tracking-wide truncate">
                              {displayName}
                            </h3>
                            {!item.is_read && (
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-black tracking-tighter uppercase shrink-0 ${priority.badgeClass}`}
                            >
                              {priority.label}
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap ml-3">
                            {getTimeAgo(item.received_at)}
                          </span>
                        </div>

                        {/* AI Brief Container */}
                        <div className="bg-background-dark/40 p-3 rounded-xl border border-slate-800/50">
                          <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
                            {item.ai_summary ? (
                              <>
                                <span className="text-primary font-bold mr-1">
                                  AI Brief:
                                </span>
                                {item.ai_summary}
                              </>
                            ) : (
                              <>
                                <span className="text-primary font-bold mr-1">
                                  Subject:
                                </span>
                                {item.subject || item.snippet || item.body?.slice(0, 150) || "No content"}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 rounded-2xl border border-slate-800 bg-surface-dark/40 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-600 mb-2 block">
                  inbox
                </span>
                <p className="text-slate-400">No messages yet</p>
                <p className="text-sm text-slate-500 mt-1">
                  Connect your accounts and sync to see your messages
                </p>
              </div>
            )}
          </div>

          {/* View More */}
          {recentItems.length > 5 && (
            <div className="flex justify-center mt-4 pb-8">
              <Link
                href="/inbox"
                className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-primary border border-slate-800 hover:border-primary/40 rounded-xl transition-all"
              >
                View {recentItems.length - 5} more in Inbox &rarr;
              </Link>
            </div>
          )}
          {recentItems.length > 0 && recentItems.length <= 5 && (
            <div className="flex justify-center mt-4 pb-8">
              <Link
                href="/inbox"
                className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-primary border border-slate-800 hover:border-primary/40 rounded-xl transition-all"
              >
                View all in Inbox &rarr;
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
