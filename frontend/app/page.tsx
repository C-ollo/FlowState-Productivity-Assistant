"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
        <div className="p-6 flex items-center gap-3">
          <div className="size-8 bg-primary rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-white">bolt</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight">Productivity OS</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary cursor-pointer">
            <span className="material-symbols-outlined">inbox</span>
            <p className="text-sm font-semibold">Inbox</p>
          </div>
          <Link href="/deadlines">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <span className="material-symbols-outlined">alarm</span>
              <p className="text-sm font-medium">Deadlines</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <span className="material-symbols-outlined">checklist</span>
            <p className="text-sm font-medium">Tasks</p>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <span className="material-symbols-outlined">calendar_today</span>
            <p className="text-sm font-medium">Calendar</p>
          </div>
          <div className="mt-8 px-3 py-2 text-xs font-bold uppercase text-slate-400 tracking-wider">Workspace</div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <span className="material-symbols-outlined">settings</span>
            <p className="text-sm font-medium">Settings</p>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 text-slate-500">
            <span className="material-symbols-outlined text-emerald-500 text-sm">cloud_done</span>
            <p className="text-xs font-medium">Local-first: Synced</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 backdrop-blur-md">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/50 text-sm outline-none"
                placeholder="Search Gmail, Slack, or Calendar..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="size-8 rounded-full bg-cover bg-center border-2 border-slate-200 dark:border-slate-700 bg-gray-300"></div>
          </div>
        </header>

        {/* Dashboard Scrollable Section */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Proactive Briefing Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">Proactive Briefing</h2>
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">AI Generated</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10">
                <p className="text-sm font-medium text-primary mb-1">Today's Priorities</p>
                <p className="text-2xl font-bold">3 Tasks</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">Budget Approval</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">Q4 Roadmap</span>
                </div>
              </div>
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <p className="text-sm font-medium text-slate-500 mb-1">Slack Threads</p>
                <p className="text-2xl font-bold text-orange-500">2 Urgent</p>
                <p className="text-xs text-slate-400 mt-1">Require your immediate input</p>
              </div>
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <p className="text-sm font-medium text-slate-500 mb-1">Next Meeting</p>
                <p className="text-2xl font-bold">In 24 mins</p>
                <p className="text-xs text-slate-400 mt-1">Design Sync w/ Platform Team</p>
              </div>
            </div>
          </section>

          {/* Unified Feed Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">Unified Feed</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-200 dark:bg-slate-800">All Sources</button>
                <button className="px-3 py-1 text-xs font-semibold rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Gmail</button>
                <button className="px-3 py-1 text-xs font-semibold rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Slack</button>
              </div>
            </div>
            <div className="space-y-3">
              {/* Feed Item: Slack */}
              <div className="group relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-primary/30 transition-all cursor-pointer">
                <div className="flex gap-4">
                  <div className="size-10 rounded-lg bg-[#4A154B] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-xl">chat</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm truncate">#product-design-system</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">HIGH PRIORITY</span>
                      </div>
                      <span className="text-xs text-slate-400">2m ago</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      <span className="text-primary font-semibold">AI Summary:</span> Sarah shared the final V2 components. Needs approval for the typography tokens by EOD to keep developer handoff on schedule.
                    </p>
                  </div>
                </div>
              </div>
              {/* Feed Item: Gmail */}
              <div className="group relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-primary/30 transition-all cursor-pointer">
                <div className="flex gap-4">
                  <div className="size-10 rounded-lg bg-[#EA4335] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-xl">mail</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm truncate">Marcus Miller</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">READ LATER</span>
                      </div>
                      <span className="text-xs text-slate-400">14m ago</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      <span className="text-primary font-semibold">AI Summary:</span> Monthly budget review for October. No major discrepancies found, but Marcus noted a 5% increase in AWS costs.
                    </p>
                  </div>
                </div>
              </div>
              {/* Feed Item: Slack */}
              <div className="group relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-primary/30 transition-all cursor-pointer">
                <div className="flex gap-4">
                  <div className="size-10 rounded-lg bg-[#4A154B] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-xl">chat</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm truncate">Direct: Jordan Lee</h3>
                      </div>
                      <span className="text-xs text-slate-400">45m ago</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      <span className="text-primary font-semibold">AI Summary:</span> Jordan is asking if you have time for a quick 5-min huddle about the investor deck before the board meeting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* AI Assistant Sidebar (Right) */}
      <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined font-bold">smart_toy</span>
            <h2 className="text-sm font-bold uppercase tracking-widest">AI Assistant</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex flex-col gap-2">
            <div className="self-end bg-primary text-white text-xs py-2 px-3 rounded-xl rounded-tr-none max-w-[90%]">
              What's due this week?
            </div>
            <div className="self-start bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs py-2 px-3 rounded-xl rounded-tl-none max-w-[90%] border border-slate-200 dark:border-slate-700">
              You have 3 project milestones:
              <ul className="mt-1 list-disc list-inside opacity-90">
                <li>Q4 Budget Approval (Thu)</li>
                <li>Team Design Sync (Fri)</li>
                <li>Hiring Roadmap Update (Fri)</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="self-end bg-primary text-white text-xs py-2 px-3 rounded-xl rounded-tr-none max-w-[90%]">
              Summarize Slack #marketing
            </div>
            <div className="self-start bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs py-2 px-3 rounded-xl rounded-tl-none max-w-[90%] border border-slate-200 dark:border-slate-700">
              The marketing team is focusing on the 'Holiday Launch' campaign. 2 new assets were uploaded, and the influencers list is finalized.
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="relative">
            <input
              className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg pr-10 text-sm focus:ring-primary focus:border-primary py-2 pl-3 outline-none"
              placeholder="Ask anything..."
              type="text"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="text-[10px] text-slate-500 hover:text-primary transition-colors border border-slate-200 dark:border-slate-700 px-2 py-1 rounded">Next deadline?</button>
            <button className="text-[10px] text-slate-500 hover:text-primary transition-colors border border-slate-200 dark:border-slate-700 px-2 py-1 rounded">Daily recap</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
