"use client";

import { useState } from "react";
import { useInboxItems, useInboxStats } from "@/hooks/use-items";
import { useUser } from "@/hooks/use-auth";
import { Item } from "@/types";

const sourceFilters = ["All Sources", "Gmail", "Slack", "Calendar"];

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

function getPriorityBadge(item: Item): { text: string; color: string } | null {
  if (item.action_required) {
    return { text: "ACTION REQUIRED", color: "bg-red-500/10 text-red-400" };
  }
  if (item.priority_score >= 80) {
    return { text: "HIGH PRIORITY", color: "bg-red-500/10 text-red-400" };
  }
  if (item.priority_score >= 60) {
    return { text: "IMPORTANT", color: "bg-amber-500/10 text-amber-400" };
  }
  return null;
}

export default function InboxPage() {
  const [activeFilter, setActiveFilter] = useState("All Sources");
  const { data: user } = useUser();

  const platformFilter = activeFilter === "All Sources"
    ? undefined
    : activeFilter.toLowerCase();

  const { data: itemsData, isLoading, error } = useInboxItems({
    platform: platformFilter,
    is_archived: false,
    page_size: 50,
  });

  const { data: stats } = useInboxStats();

  const items = itemsData?.items || [];

  return (
    <>
      {/* Header Section */}
      <header className="border-b border-border-dark px-8 py-4 flex items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">
            search
          </span>
          <input
            className="w-full bg-border-dark border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary placeholder:text-text-muted"
            placeholder="Search Gmail, Slack, or Calendar..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-4 ml-4">
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
        {/* Stats Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Inbox Overview</h2>
            <span className="flex items-center gap-1.5 bg-surface-dark border border-border-dark rounded-lg px-3 py-1 text-xs text-text-muted">
              <span className="material-symbols-outlined text-sm text-green-400">
                sync
              </span>
              Synced
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-surface-dark rounded-xl border border-border-dark p-5">
              <p className="text-sm text-primary mb-1">Total Items</p>
              <p className="text-2xl font-bold text-white">
                {items.length}
              </p>
            </div>
            <div className="bg-surface-dark rounded-xl border border-border-dark p-5">
              <p className="text-sm text-primary mb-1">Unread</p>
              <p className="text-2xl font-bold text-amber-400">
                {stats?.unread_count || 0}
              </p>
            </div>
            <div className="bg-surface-dark rounded-xl border border-border-dark p-5">
              <p className="text-sm text-primary mb-1">Action Required</p>
              <p className="text-2xl font-bold text-red-400">
                {stats?.action_required_count || 0}
              </p>
            </div>
            <div className="bg-surface-dark rounded-xl border border-border-dark p-5">
              <p className="text-sm text-primary mb-1">From Gmail</p>
              <p className="text-2xl font-bold text-white">
                {items.filter(i => i.platform === "gmail").length}
              </p>
            </div>
          </div>
        </section>

        {/* Unified Feed Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Unified Feed</h2>
            <div className="relative flex items-center bg-border-dark rounded-lg p-1">
              {sourceFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeFilter === filter
                      ? "bg-surface-dark shadow-sm text-white"
                      : "text-text-muted hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">
                progress_activity
              </span>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-red-400">Failed to load inbox items</p>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-surface-dark rounded-xl border border-border-dark p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-text-muted mb-2">
                inbox
              </span>
              <p className="text-text-muted">No items in your inbox</p>
              <p className="text-sm text-text-muted mt-1">
                Connect your accounts and sync to see your messages here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item: Item) => {
                const platformStyle = getPlatformIcon(item.platform);
                const badge = getPriorityBadge(item);
                const displayTitle = item.sender_name || item.sender_email || item.subject || "Unknown";
                const displaySummary = item.ai_summary || item.snippet || item.subject || "";

                return (
                  <div
                    key={item.id}
                    className={`bg-surface-dark rounded-xl border border-border-dark p-4 hover:border-primary/50 transition-all cursor-pointer ${
                      !item.is_read ? "border-l-2 border-l-primary" : ""
                    }`}
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
                          <h3 className={`text-sm font-bold ${!item.is_read ? "text-white" : "text-text-muted"}`}>
                            {displayTitle}
                          </h3>
                          {badge && (
                            <span
                              className={`text-[10px] ${badge.color} px-2 py-0.5 rounded font-bold`}
                            >
                              {badge.text}
                            </span>
                          )}
                        </div>
                        {item.subject && item.sender_name && (
                          <p className="text-xs text-text-muted mb-1 truncate">
                            {item.subject}
                          </p>
                        )}
                        <p className="text-sm text-text-muted leading-relaxed line-clamp-2">
                          {item.ai_summary && (
                            <span className="text-primary">AI Summary: </span>
                          )}
                          {displaySummary}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-text-muted whitespace-nowrap">
                          {getTimeAgo(item.received_at)}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          item.priority_score >= 80 ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                          item.priority_score >= 60 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          item.priority_score >= 40 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          "bg-slate-800 text-slate-500 border border-slate-700"
                        }`}>
                          {item.priority_score >= 80 ? "High" :
                           item.priority_score >= 60 ? "Medium" :
                           item.priority_score >= 40 ? "Normal" : "Low"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
