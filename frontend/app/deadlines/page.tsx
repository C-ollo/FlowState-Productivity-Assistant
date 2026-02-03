"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Deadlines() {
    const router = useRouter();

    return (
        <div className="bg-background-light dark:bg-background-dark text-white font-display min-h-screen flex overflow-hidden">
            {/* Side Navigation */}
            <aside className="w-64 border-r border-border-dark flex flex-col justify-between bg-background-light dark:bg-background-dark p-4">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary rounded-lg p-2 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white">bolt</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-white text-base font-bold leading-none">Productivity OS</h1>
                            <p className="text-[#9ca6ba] text-xs font-medium">Local-first AI</p>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-1">
                        <Link href="/">
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9ca6ba] hover:text-white cursor-pointer transition-colors">
                                <span className="material-symbols-outlined">dashboard</span>
                                <p className="text-sm font-medium">Dashboard</p>
                            </div>
                        </Link>
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-border-dark text-white cursor-pointer">
                            <span className="material-symbols-outlined">timer</span>
                            <p className="text-sm font-medium">Deadlines</p>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9ca6ba] hover:text-white cursor-pointer transition-colors">
                            <span className="material-symbols-outlined">chat_bubble</span>
                            <p className="text-sm font-medium">Messages</p>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9ca6ba] hover:text-white cursor-pointer transition-colors">
                            <span className="material-symbols-outlined">calendar_today</span>
                            <p className="text-sm font-medium">Calendar</p>
                        </div>
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9ca6ba] hover:text-white cursor-pointer transition-colors">
                            <span className="material-symbols-outlined">settings</span>
                            <p className="text-sm font-medium">Settings</p>
                        </div>
                    </nav>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="bg-surface-dark p-3 rounded-xl border border-border-dark">
                        <p className="text-xs text-[#9ca6ba] mb-2 uppercase font-bold tracking-wider">Sync Status</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-green-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
                            </span>
                            <span className="text-[10px] text-[#9ca6ba]">2m ago</span>
                        </div>
                    </div>
                    <button className="w-full bg-primary hover:bg-blue-600 transition-colors text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">add</span> New Task
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header Section */}
                <header className="border-b border-border-dark px-8 py-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <h2 className="text-xl font-bold tracking-tight">Deadlines & Action Items</h2>
                            <div className="relative flex items-center bg-border-dark rounded-lg p-1">
                                <button className="bg-surface-dark px-4 py-1.5 rounded-md text-sm font-medium shadow-sm">Kanban</button>
                                <button className="px-4 py-1.5 rounded-md text-sm font-medium text-[#9ca6ba]">Timeline</button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative w-64">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca6ba] text-lg">search</span>
                                <input
                                    className="w-full bg-border-dark border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary placeholder:text-[#9ca6ba] outline-none"
                                    placeholder="Search deadlines..."
                                    type="text"
                                />
                            </div>
                            <button className="p-2 bg-border-dark rounded-lg text-[#9ca6ba] hover:text-white transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                            </button>
                            <div className="w-9 h-9 rounded-full bg-center bg-cover border border-border-dark bg-gray-500"></div>
                        </div>
                    </div>
                    {/* Filters */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary px-4 cursor-pointer">
                            <p className="text-white text-sm font-medium leading-normal">All</p>
                        </div>
                        <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-border-dark px-4 hover:bg-surface-dark cursor-pointer transition-colors">
                            <p className="text-[#9ca6ba] text-sm font-medium leading-normal">Work</p>
                        </div>
                        <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-border-dark px-4 hover:bg-surface-dark cursor-pointer transition-colors">
                            <p className="text-[#9ca6ba] text-sm font-medium leading-normal">School</p>
                        </div>
                        <div className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-border-dark px-4 hover:bg-surface-dark cursor-pointer transition-colors">
                            <p className="text-[#9ca6ba] text-sm font-medium leading-normal">Personal</p>
                        </div>
                        <div className="h-4 w-px bg-border-dark mx-2"></div>
                        <button className="text-xs text-[#9ca6ba] flex items-center gap-1 hover:text-white">
                            <span className="material-symbols-outlined text-sm">filter_list</span> Filter by Platform
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
                                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span> Overdue
                                    <span className="ml-1 text-xs px-2 py-0.5 rounded bg-red-400/10 border border-red-400/20">2</span>
                                </h3>
                            </div>
                            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                                {/* Card 1 */}
                                <div className="bg-surface-dark rounded-xl border-l-4 border-l-red-500 border border-border-dark p-4 shadow-lg group hover:border-primary/50 transition-all cursor-pointer">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="material-symbols-outlined text-[#E01E5A] text-xl" title="Slack">alternate_email</span>
                                        <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold">URGENT</span>
                                    </div>
                                    <h4 className="text-sm font-bold leading-tight mb-2 group-hover:text-primary transition-colors">Fix CSS bug in production dashboard</h4>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 rounded-full bg-cover bg-gray-400"></div>
                                        <p className="text-xs text-[#9ca6ba]">Sarah Chen <span class="mx-1">•</span> #project-alpha</p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-border-dark pt-3 mt-1">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] uppercase text-[#9ca6ba] font-bold">Extracted Deadline</p>
                                            <p className="text-xs text-red-400 font-medium">Yesterday, 5:00 PM</p>
                                        </div>
                                        <button className="bg-primary text-white text-[11px] font-bold py-1.5 px-3 rounded-lg hover:bg-blue-600 transition-colors">
                                            Create Task
                                        </button>
                                    </div>
                                </div>
                                {/* Card 2 */}
                                <div className="bg-surface-dark rounded-xl border border-border-dark p-4 shadow-lg hover:border-primary/50 transition-all cursor-pointer">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="material-symbols-outlined text-[#EA4335] text-xl" title="Gmail">mail</span>
                                    </div>
                                    <h4 className="text-sm font-bold leading-tight mb-2">Q3 Review Feedback and Action Items</h4>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 rounded-full bg-cover bg-gray-400"></div>
                                        <p className="text-xs text-[#9ca6ba]">Mark Peters <span class="mx-1">•</span> HR</p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-border-dark pt-3 mt-1">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] uppercase text-[#9ca6ba] font-bold">Extracted Deadline</p>
                                            <p className="text-xs text-red-400 font-medium">Oct 12th</p>
                                        </div>
                                        <button className="bg-primary text-white text-[11px] font-bold py-1.5 px-3 rounded-lg hover:bg-blue-600 transition-colors">
                                            Create Task
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Due Today Column */}
                        <div className="flex flex-col w-80 gap-4">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-400">
                                    Due Today
                                    <span className="ml-1 text-xs px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">3</span>
                                </h3>
                            </div>
                            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                                {/* Card 3 */}
                                <div className="bg-surface-dark rounded-xl border border-border-dark p-4 shadow-lg hover:border-primary/50 transition-all cursor-pointer">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="material-symbols-outlined text-[#4285F4] text-xl" title="Google Calendar">calendar_month</span>
                                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">MEETING</span>
                                    </div>
                                    <h4 className="text-sm font-bold leading-tight mb-2">Weekly Sync: Design Operations</h4>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 rounded-full bg-cover bg-gray-400"></div>
                                        <p className="text-xs text-[#9ca6ba]">Internal <span class="mx-1">•</span> Calendar</p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-border-dark pt-3 mt-1">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] uppercase text-[#9ca6ba] font-bold">Time Remaining</p>
                                            <p className="text-xs text-amber-400 font-medium">In 2 hours</p>
                                        </div>
                                        <button className="bg-primary text-white text-[11px] font-bold py-1.5 px-3 rounded-lg hover:bg-blue-600 transition-colors">
                                            Create Task
                                        </button>
                                    </div>
                                </div>
                                {/* Card 4 */}
                                <div className="bg-surface-dark rounded-xl border border-border-dark p-4 shadow-lg hover:border-primary/50 transition-all cursor-pointer">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="material-symbols-outlined text-[#E01E5A] text-xl" title="Slack">alternate_email</span>
                                    </div>
                                    <h4 className="text-sm font-bold leading-tight mb-2">Review draft proposal for client X</h4>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 rounded-full bg-cover bg-gray-400"></div>
                                        <p className="text-xs text-[#9ca6ba]">Linda Wu <span class="mx-1">•</span> #client-work</p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-border-dark pt-3 mt-1">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] uppercase text-[#9ca6ba] font-bold">Extracted Deadline</p>
                                            <p className="text-xs text-white font-medium">Today, 6:00 PM</p>
                                        </div>
                                        <button className="bg-primary text-white text-[11px] font-bold py-1.5 px-3 rounded-lg hover:bg-blue-600 transition-colors">
                                            Create Task
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Due This Week Column */}
                        <div className="flex flex-col w-80 gap-4">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#9ca6ba]">
                                    Due This Week
                                    <span className="ml-1 text-xs px-2 py-0.5 rounded bg-border-dark">5</span>
                                </h3>
                            </div>
                            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                                {/* Card 5 */}
                                <div className="bg-surface-dark rounded-xl border border-border-dark p-4 shadow-lg hover:border-primary/50 transition-all cursor-pointer">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="material-symbols-outlined text-[#EA4335] text-xl" title="Gmail">mail</span>
                                    </div>
                                    <h4 className="text-sm font-bold leading-tight mb-2">Flight Confirmation: SF to NY</h4>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 rounded-full bg-cover bg-gray-400"></div>
                                        <p className="text-xs text-[#9ca6ba]">United Airlines <span class="mx-1">•</span> Personal</p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-border-dark pt-3 mt-1">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] uppercase text-[#9ca6ba] font-bold">Extracted Deadline</p>
                                            <p className="text-xs text-white font-medium">Thursday, 8:00 AM</p>
                                        </div>
                                        <button className="bg-primary text-white text-[11px] font-bold py-1.5 px-3 rounded-lg hover:bg-blue-600 transition-colors">
                                            Create Task
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Column */}
                        <div className="flex flex-col w-80 gap-4">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#9ca6ba]">
                                    Upcoming
                                    <span className="ml-1 text-xs px-2 py-0.5 rounded bg-border-dark">12</span>
                                </h3>
                            </div>
                            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-dark rounded-xl text-center">
                                    <span className="material-symbols-outlined text-border-dark text-4xl mb-2">event_available</span>
                                    <p className="text-xs text-[#9ca6ba]">Items for next week will appear here as they are detected.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Context Info Panel (Right) */}
            <aside className="w-80 border-l border-border-dark bg-background-light dark:bg-background-dark p-6 hidden xl:flex flex-col gap-6">
                <div>
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">psychology</span> AI Insights
                    </h3>
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                        <p className="text-xs text-white leading-relaxed">
                            Based on your Slack activity, you have <span className="text-primary font-bold">3 follow-ups</span> pending for #project-alpha. Would you like to batch create these tasks?
                        </p>
                        <button className="mt-3 w-full border border-primary text-primary text-[11px] font-bold py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors">
                            View Follow-ups
                        </button>
                    </div>
                </div>
                <div>
                    <h3 className="text-xs font-bold text-[#9ca6ba] uppercase tracking-widest mb-4">Source Platform Activity</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-border-dark rounded-lg">
                                <span className="material-symbols-outlined text-[#E01E5A] text-xl">alternate_email</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-xs font-bold">Slack</p>
                                    <p className="text-[10px] text-[#9ca6ba]">82% Scanned</p>
                                </div>
                                <div className="w-full bg-border-dark h-1 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full" style={{ width: '82%' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-border-dark rounded-lg">
                                <span className="material-symbols-outlined text-[#EA4335] text-xl">mail</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-xs font-bold">Gmail</p>
                                    <p className="text-[10px] text-[#9ca6ba]">100% Scanned</p>
                                </div>
                                <div className="w-full bg-border-dark h-1 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-auto">
                    <div className="bg-surface-dark border border-border-dark rounded-xl p-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#9ca6ba]">info</span>
                        <p className="text-[11px] text-[#9ca6ba] leading-normal">
                            AI extraction is local-first. No sensitive message data leaves this device.
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    );
}
