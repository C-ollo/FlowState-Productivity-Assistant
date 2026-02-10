"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useInboxItems } from "@/hooks/use-items";
import { useUser } from "@/hooks/use-auth";
import { useTodayBriefing } from "@/hooks/use-briefings";
import { useUpcomingDeadlines } from "@/hooks/use-deadlines";
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

function getPlatformIcon(platform: string): { icon: string; color: string; bg: string } {
  switch (platform) {
    case "gmail":
      return { icon: "mail", color: "text-gmail", bg: "bg-[#EA4335]/10" };
    case "slack":
      return { icon: "alternate_email", color: "text-slack", bg: "bg-[#E01E5A]/10" };
    case "calendar":
      return { icon: "calendar_month", color: "text-calendar", bg: "bg-[#4285F4]/10" };
    default:
      return { icon: "inbox", color: "text-text-muted", bg: "bg-border-dark" };
  }
}

export default function DashboardPage() {
  const { data: user } = useUser();
  const { data: itemsData } = useInboxItems({ is_archived: false, page_size: 5 });
  const { data: briefing } = useTodayBriefing();
  const { data: upcomingDeadlines } = useUpcomingDeadlines(7);
  const { data: taskStats } = useTaskStats();

  const recentItems = itemsData?.items || [];
  const unreadCount = recentItems.filter((item: Item) => !item.is_read).length;

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  const greeting = getGreeting();

  return (
    <>
      {/* Header Section */}
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Stats Overview */}
        <section className="mb-8">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-surface-dark rounded-xl border border-border-dark p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary">inbox</span>
                <p className="text-sm text-text-muted">Unread Messages</p>
              </div>
              <p className="text-3xl font-bold text-white">
                {unreadCount}
              </p>
            </div>
            <div className="bg-surface-dark rounded-xl border border-border-dark p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-amber-400">timer</span>
                <p className="text-sm text-text-muted">Upcoming Deadlines</p>
              </div>
              <p className="text-3xl font-bold text-amber-400">
                {upcomingDeadlines?.length || 0}
              </p>
            </div>
            <div className="bg-surface-dark rounded-xl border border-border-dark p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-blue-400">task_alt</span>
                <p className="text-sm text-text-muted">Open Tasks</p>
              </div>
              <p className="text-3xl font-bold text-blue-400">
                {taskStats?.pending || 0}
              </p>
            </div>
            <div className="bg-surface-dark rounded-xl border border-border-dark p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-green-400">check_circle</span>
                <p className="text-sm text-text-muted">Tasks Completed</p>
              </div>
              <p className="text-3xl font-bold text-green-400">
                {taskStats?.completed || 0}
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-6">
          {/* AI Briefing */}
          <section className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Today&apos;s Briefing</h3>
              <span className="flex items-center gap-1.5 bg-surface-dark border border-border-dark rounded-lg px-3 py-1 text-xs text-text-muted">
                <span className="material-symbols-outlined text-sm text-primary">
                  auto_awesome
                </span>
                AI Generated
              </span>
            </div>
            <div className="bg-surface-dark rounded-xl border border-border-dark p-6">
              {briefing ? (
                <div className="briefing-content">
                  <ReactMarkdown
                    components={{
                      h2: ({ children }) => (
                        <div className="flex items-center gap-2 mb-3 mt-4 first:mt-0">
                          <h2 className="text-base font-bold text-white">{children}</h2>
                        </div>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-bold text-primary mt-3 mb-2">{children}</h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-2 mb-4">{children}</ul>
                      ),
                      li: ({ children }) => (
                        <li className="flex items-start gap-2 text-sm text-text-muted">
                          <span className="material-symbols-outlined text-primary text-sm mt-0.5">arrow_right</span>
                          <span className="flex-1">{children}</span>
                        </li>
                      ),
                      p: ({ children }) => (
                        <p className="text-sm text-text-muted mb-3 leading-relaxed">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-white font-semibold">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="text-amber-400 not-italic">{children}</em>
                      ),
                    }}
                  >
                    {briefing.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-text-muted mb-2">
                    auto_awesome
                  </span>
                  <p className="text-text-muted">No briefing available yet</p>
                  <p className="text-sm text-text-muted mt-1">
                    Connect your accounts and sync to generate your daily briefing
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Upcoming Deadlines */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Upcoming Deadlines</h3>
              <Link href="/deadlines" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="bg-surface-dark rounded-xl border border-border-dark p-4 space-y-3">
              {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.slice(0, 5).map((deadline: any) => (
                  <div
                    key={deadline.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-border-dark transition-colors"
                  >
                    <span className="material-symbols-outlined text-amber-400">
                      timer
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{deadline.title}</p>
                      <p className="text-xs text-text-muted">
                        Due {new Date(deadline.due_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-2xl text-text-muted mb-2">
                    event_available
                  </span>
                  <p className="text-sm text-text-muted">No upcoming deadlines</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Recent Messages */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Recent Messages</h3>
            <Link href="/inbox" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentItems.length > 0 ? (
              recentItems.map((item: Item) => {
                const platformStyle = getPlatformIcon(item.platform);
                const displayTitle = item.sender_name || item.sender_email || item.subject || "Unknown";

                return (
                  <div
                    key={item.id}
                    className="bg-surface-dark rounded-xl border border-border-dark p-4 hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <div className="flex gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg ${platformStyle.bg} flex items-center justify-center shrink-0`}
                      >
                        <span
                          className={`material-symbols-outlined ${platformStyle.color} text-xl`}
                        >
                          {platformStyle.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold">{displayTitle}</h4>
                          {!item.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted truncate">
                          {item.subject}
                        </p>
                      </div>
                      <span className="text-xs text-text-muted whitespace-nowrap">
                        {getTimeAgo(item.received_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-surface-dark rounded-xl border border-border-dark p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-text-muted mb-2">
                  inbox
                </span>
                <p className="text-text-muted">No recent messages</p>
                <p className="text-sm text-text-muted mt-1">
                  Connect your accounts and sync to see your messages
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
