"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#101622] text-white font-display antialiased selection:bg-primary/30">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex flex-col shrink-0 border-r border-[#282e39] bg-[#101622]">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[#282e39]/50">
          <div className="size-8 bg-primary rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[20px]">bolt</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">Productivity OS</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary cursor-pointer group">
            <span className="material-symbols-outlined text-[22px]">inbox</span>
            <p className="text-sm font-semibold">Inbox</p>
          </div>
          <Link href="/deadlines">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#9ca6ba] hover:bg-[#1b1f27] hover:text-white transition-all cursor-pointer group">
              <span className="material-symbols-outlined text-[22px] group-hover:text-white">alarm</span>
              <p className="text-sm font-medium">Deadlines</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#9ca6ba] hover:bg-[#1b1f27] hover:text-white transition-all cursor-pointer group">
            <span className="material-symbols-outlined text-[22px] group-hover:text-white">checklist</span>
            <p className="text-sm font-medium">Tasks</p>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#9ca6ba] hover:bg-[#1b1f27] hover:text-white transition-all cursor-pointer group">
            <span className="material-symbols-outlined text-[22px] group-hover:text-white">calendar_today</span>
            <p className="text-sm font-medium">Calendar</p>
          </div>

          <div className="mt-8 px-3 py-2 text-xs font-bold uppercase text-slate-500 tracking-wider">Workspace</div>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#9ca6ba] hover:bg-[#1b1f27] hover:text-white transition-all cursor-pointer group">
            <span className="material-symbols-outlined text-[22px] group-hover:text-white">settings</span>
            <p className="text-sm font-medium">Settings</p>
          </div>
        </nav>

        <div className="p-4 border-t border-[#282e39]">
          <div className="flex items-center gap-3 px-3 py-2 text-[#9ca6ba]/70">
            <span className="material-symbols-outlined text-emerald-500 text-[18px]">cloud_done</span>
            <p className="text-xs font-medium">Local-first: Synced</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#101622]">
        {/* Header */}
        <header className="h-16 shrink-0 flex items-center justify-between px-8 border-b border-[#282e39] bg-[#101622]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-[#1b1f27] border border-transparent focus:border-primary/30 rounded-lg focus:ring-4 focus:ring-primary/10 text-sm outline-none text-white placeholder-slate-500 transition-all"
                placeholder="Search Gmail, Slack, or Calendar..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-[#1b1f27] rounded-full transition-all relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-[#101622]"></span>
            </button>
            <div className="size-9 rounded-full bg-cover bg-center border-2 border-[#282e39] bg-gradient-to-br from-indigo-500 to-purple-500 cursor-pointer hover:border-primary/50 transition-colors"></div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Proactive Briefing Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Proactive Briefing
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 bg-[#1b1f27] border border-[#282e39] px-2 py-1 rounded">AI Generated</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Card 1 */}
                <div className="p-5 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent hover:border-primary/40 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-primary">Today's Priorities</p>
                    <span className="material-symbols-outlined text-primary/50 group-hover:text-primary transition-colors">priority_high</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-4">3 Tasks</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/20 text-blue-200 font-semibold border border-primary/20">Budget Approval</span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/20 text-blue-200 font-semibold border border-primary/20">Q4 Roadmap</span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="p-5 rounded-2xl border border-[#282e39] bg-[#1b1f27] hover:bg-[#20252e] hover:border-orange-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-[#9ca6ba]">Slack Threads</p>
                    <span className="material-symbols-outlined text-orange-500/50 group-hover:text-orange-500 transition-colors">forum</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-500 mb-1">2 Urgent</p>
                  <p className="text-xs text-slate-400">Require your immediate input</p>
                </div>

                {/* Card 3 */}
                <div className="p-5 rounded-2xl border border-[#282e39] bg-[#1b1f27] hover:bg-[#20252e] hover:border-emerald-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-[#9ca6ba]">Next Meeting</p>
                    <span className="material-symbols-outlined text-emerald-500/50 group-hover:text-emerald-500 transition-colors">videocam</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">In 24 mins</p>
                  <p className="text-xs text-slate-400 truncate">Design Sync w/ Platform Team</p>
                </div>
              </div>
            </section>

            {/* Unified Feed Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold tracking-tight text-white">Unified Feed</h2>
                <div className="flex gap-2 bg-[#1b1f27] p-1 rounded-lg border border-[#282e39]">
                  <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#282e39] text-white shadow-sm">All Sources</button>
                  <button className="px-3 py-1.5 text-xs font-semibold rounded-md text-[#9ca6ba] hover:text-white hover:bg-[#282e39]/50 transition-colors">Gmail</button>
                  <button className="px-3 py-1.5 text-xs font-semibold rounded-md text-[#9ca6ba] hover:text-white hover:bg-[#282e39]/50 transition-colors">Slack</button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Feed Item: Slack */}
                <div className="group relative p-5 rounded-2xl border border-[#282e39] bg-[#1b1f27] hover:border-primary/40 hover:bg-[#20252e] transition-all cursor-pointer">
                  <div className="flex gap-5">
                    <div className="size-12 rounded-xl bg-[#4A154B] flex items-center justify-center shrink-0 shadow-lg shadow-[#4A154B]/20">
                      <span className="material-symbols-outlined text-white text-2xl">chat</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-sm truncate text-white">#product-design-system</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">HIGH PRIORITY</span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">2m ago</span>
                      </div>
                      <p className="text-sm text-[#9ca6ba] leading-relaxed line-clamp-2 group-hover:text-slate-300 transition-colors">
                        <span className="text-primary font-semibold">AI Summary:</span> Sarah shared the final V2 components. Needs approval for the typography tokens by EOD to keep developer handoff on schedule.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feed Item: Gmail */}
                <div className="group relative p-5 rounded-2xl border border-[#282e39] bg-[#1b1f27] hover:border-primary/40 hover:bg-[#20252e] transition-all cursor-pointer">
                  <div className="flex gap-5">
                    <div className="size-12 rounded-xl bg-[#EA4335] flex items-center justify-center shrink-0 shadow-lg shadow-[#EA4335]/20">
                      <span className="material-symbols-outlined text-white text-2xl">mail</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-sm truncate text-white">Marcus Miller</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">READ LATER</span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">14m ago</span>
                      </div>
                      <p className="text-sm text-[#9ca6ba] leading-relaxed line-clamp-2 group-hover:text-slate-300 transition-colors">
                        <span className="text-primary font-semibold">AI Summary:</span> Monthly budget review for October. No major discrepancies found, but Marcus noted a 5% increase in AWS costs.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feed Item: Slack Direct */}
                <div className="group relative p-5 rounded-2xl border border-[#282e39] bg-[#1b1f27] hover:border-primary/40 hover:bg-[#20252e] transition-all cursor-pointer">
                  <div className="flex gap-5">
                    <div className="size-12 rounded-xl bg-[#4A154B] flex items-center justify-center shrink-0 shadow-lg shadow-[#4A154B]/20">
                      <span className="material-symbols-outlined text-white text-2xl">chat</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-sm truncate text-white">Direct: Jordan Lee</h3>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">45m ago</span>
                      </div>
                      <p className="text-sm text-[#9ca6ba] leading-relaxed line-clamp-2 group-hover:text-slate-300 transition-colors">
                        <span className="text-primary font-semibold">AI Summary:</span> Jordan is asking if you have time for a quick 5-min huddle about the investor deck before the board meeting.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* AI Assistant Sidebar (Right) */}
      <aside className="w-80 shrink-0 border-l border-[#282e39] bg-[#101622] flex flex-col">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-[#282e39]">
          <span className="material-symbols-outlined font-bold text-primary">smart_toy</span>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#9ca6ba]">AI Assistant</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="flex flex-col gap-2">
            <div className="self-end bg-primary text-white text-xs py-2.5 px-4 rounded-2xl rounded-tr-sm max-w-[90%] shadow-lg shadow-primary/10">
              What's due this week?
            </div>
            <div className="self-start bg-[#1b1f27] text-[#9ca6ba] text-xs py-3 px-4 rounded-2xl rounded-tl-sm max-w-[90%] border border-[#282e39] leading-relaxed">
              You have 3 project milestones:
              <ul className="mt-2 space-y-1 list-disc list-inside opacity-90">
                <li>Q4 Budget Approval (Thu)</li>
                <li>Team Design Sync (Fri)</li>
                <li>Hiring Roadmap Update (Fri)</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="self-end bg-primary text-white text-xs py-2.5 px-4 rounded-2xl rounded-tr-sm max-w-[90%] shadow-lg shadow-primary/10">
              Summarize Slack #marketing
            </div>
            <div className="self-start bg-[#1b1f27] text-[#9ca6ba] text-xs py-3 px-4 rounded-2xl rounded-tl-sm max-w-[90%] border border-[#282e39] leading-relaxed">
              The marketing team is focusing on the 'Holiday Launch' campaign. 2 new assets were uploaded, and the influencers list is finalized.
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#101622] border-t border-[#282e39]">
          <div className="relative">
            <input
              className="w-full bg-[#1b1f27] border border-[#282e39] rounded-xl pr-10 pl-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-white placeholder-slate-500 outline-none transition-all shadow-inner"
              placeholder="Ask anything..."
              type="text"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="text-[10px] font-medium text-[#9ca6ba] hover:text-white hover:bg-[#282e39] transition-colors border border-[#282e39] px-2.5 py-1.5 rounded-lg">Next deadline?</button>
            <button className="text-[10px] font-medium text-[#9ca6ba] hover:text-white hover:bg-[#282e39] transition-colors border border-[#282e39] px-2.5 py-1.5 rounded-lg">Daily recap</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
