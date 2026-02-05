"use client";

import { useState } from "react";

const sourceFilters = ["All Sources", "Gmail", "Slack"];

const briefingCards = [
  {
    title: "Today's Priorities",
    value: "3 Tasks",
    valueColor: "text-white",
    tags: ["Budget Approval", "Q1 Roadmap"],
  },
  {
    title: "Slack Threads",
    value: "2 Urgent",
    valueColor: "text-amber-400",
    subtitle: "Require your immediate input",
  },
  {
    title: "Next Meeting",
    value: "In 24 mins",
    valueColor: "text-white",
    subtitle: "Design Sync w/ Platform Team",
  },
];

const feedItems = [
  {
    id: 1,
    platform: "slack",
    icon: "alternate_email",
    iconColor: "text-slack",
    iconBg: "bg-[#E01E5A]/10",
    title: "#product-design-system",
    badge: "HIGH PRIORITY",
    badgeColor: "bg-red-500/10 text-red-400",
    summary:
      "Sarah shared the final V2 components. Needs approval for the typography tokens by EOD to keep developer handoff on schedule.",
    time: "2m ago",
  },
  {
    id: 2,
    platform: "gmail",
    icon: "mail",
    iconColor: "text-gmail",
    iconBg: "bg-[#EA4335]/10",
    title: "Marcus Miller",
    badge: "READ LATER",
    badgeColor: "bg-primary/10 text-primary",
    summary:
      "Monthly budget review for October. No major discrepancies found, but Marcus noted a 5% increase in AWS costs.",
    time: "14m ago",
  },
  {
    id: 3,
    platform: "slack",
    icon: "alternate_email",
    iconColor: "text-slack",
    iconBg: "bg-[#E01E5A]/10",
    title: "Direct: Jordan Lee",
    badge: null,
    summary:
      "Jordan is asking if you have time for a quick 5-min huddle about the investor deck before the board meeting.",
    time: "45m ago",
  },
  {
    id: 4,
    platform: "gmail",
    icon: "mail",
    iconColor: "text-gmail",
    iconBg: "bg-[#EA4335]/10",
    title: "Weekly Newsletter: Tech Digest",
    badge: "FYI",
    badgeColor: "bg-border-dark text-text-muted",
    summary:
      "This week in tech: AI developments, startup funding rounds, and the latest from major tech conferences.",
    time: "1h ago",
  },
];

export default function InboxPage() {
  const [activeFilter, setActiveFilter] = useState("All Sources");

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
            U
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Proactive Briefing Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Proactive Briefing</h2>
            <span className="flex items-center gap-1.5 bg-surface-dark border border-border-dark rounded-lg px-3 py-1 text-xs text-text-muted">
              <span className="material-symbols-outlined text-sm text-primary">
                auto_awesome
              </span>
              AI Generated
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {briefingCards.map((card, index) => (
              <div
                key={index}
                className="bg-surface-dark rounded-xl border border-border-dark p-5"
              >
                <p className="text-sm text-primary mb-1">{card.title}</p>
                <p className={`text-2xl font-bold ${card.valueColor}`}>
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="text-sm text-text-muted mt-1">{card.subtitle}</p>
                )}
                {card.tags && (
                  <div className="flex gap-2 mt-3">
                    {card.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded font-medium"
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

          <div className="space-y-3">
            {feedItems.map((item) => (
              <div
                key={item.id}
                className="bg-surface-dark rounded-xl border border-border-dark p-4 hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="flex gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}
                  >
                    <span
                      className={`material-symbols-outlined ${item.iconColor} text-xl`}
                    >
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold">{item.title}</h3>
                      {item.badge && (
                        <span
                          className={`text-[10px] ${item.badgeColor} px-2 py-0.5 rounded font-bold`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed">
                      <span className="text-primary">AI Summary:</span>{" "}
                      {item.summary}
                    </p>
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
