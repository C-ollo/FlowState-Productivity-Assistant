import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background-dark text-white overflow-hidden">
      {/* Background Orbs */}
      <div className="orb animate-pulse-slow w-[500px] h-[500px] bg-primary/30 top-[-100px] left-[-100px]" />
      <div className="orb animate-pulse-slow w-[400px] h-[400px] bg-purple-600/20 bottom-[10%] right-[-80px]" style={{ animationDelay: "2s" }} />
      <div className="orb animate-pulse-slow w-[300px] h-[300px] bg-blue-500/20 top-[40%] left-[50%]" style={{ animationDelay: "4s" }} />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
            <span className="material-symbols-outlined text-white">auto_awesome</span>
          </div>
          <span className="font-bold text-xl tracking-tight">
            Flow<span className="text-primary">State</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 text-sm font-medium bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors shadow-glow"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-8 border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          AI-Powered Productivity
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
          <span className="landing-gradient-text">Your Digital Life,</span>
          <br />
          <span className="landing-gradient-text">Unified.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          FlowState unifies Gmail, Slack, and Calendar into one intelligent interface.
          AI surfaces what matters, extracts deadlines, and delivers proactive briefings
          — all while keeping your data private.
        </p>

        <div className="flex items-center justify-center gap-4 mb-20">
          <Link
            href="/signup"
            className="px-8 py-3.5 text-base font-semibold bg-primary hover:bg-primary-dark text-white rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">rocket_launch</span>
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 text-base font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all backdrop-blur-sm"
          >
            Sign In
          </Link>
        </div>

        {/* App Preview */}
        <div className="relative max-w-5xl mx-auto animate-float">
          <div className="glass-panel p-1.5 shadow-2xl shadow-primary/10">
            <div className="bg-background-dark rounded-[0.75rem] overflow-hidden">
              {/* Mock Title Bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-slate-800/50 text-xs text-slate-500">
                    flowstate.app
                  </div>
                </div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="flex h-[420px] relative">
                {/* AI Scan Line */}
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                  <div className="mock-scan-line" />
                </div>

                {/* Mock Sidebar — real icons & labels */}
                <div className="w-14 md:w-52 border-r border-slate-800/50 p-2 md:p-3 flex flex-col shrink-0 bg-[#0c0c1a]">
                  {/* Logo */}
                  <div className="flex items-center gap-2 px-2 py-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
                    </div>
                    <span className="hidden md:block text-xs font-bold text-white tracking-tight">
                      Flow<span className="text-primary">State</span>
                    </span>
                  </div>

                  {/* Nav Items */}
                  {[
                    { icon: "dashboard", label: "Dashboard", active: false },
                    { icon: "inbox", label: "Inbox", active: false, badge: "12" },
                    { icon: "task_alt", label: "My Tasks", active: true },
                    { icon: "calendar_month", label: "Deadlines", active: false },
                    { icon: "settings", label: "Settings", active: false },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2.5 px-2 py-2 rounded-lg text-[11px] ${
                        item.active
                          ? "bg-primary/10 text-white mock-glow"
                          : "text-slate-500"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-base ${item.active ? "text-primary" : ""}`}>
                        {item.icon}
                      </span>
                      <span className="hidden md:block font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="hidden md:block ml-auto text-[9px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* User at bottom */}
                  <div className="mt-auto pt-3 border-t border-slate-800/50 flex items-center gap-2 px-2">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                      U
                    </div>
                    <div className="hidden md:block">
                      <div className="h-2 w-14 bg-slate-800 rounded" />
                    </div>
                  </div>
                </div>

                {/* Mock Main Area — Kanban Board */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="px-4 md:px-6 py-3 border-b border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-white text-lg">task_alt</span>
                      <span className="text-sm font-bold text-white">My Tasks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/50 text-[10px] text-slate-400">
                        <span className="material-symbols-outlined text-xs">search</span>
                        Search tasks...
                      </div>
                      <div className="px-2 py-1 rounded-md bg-primary/10 text-[10px] text-primary font-bold">+ Add Task</div>
                    </div>
                  </div>

                  {/* Kanban Columns */}
                  <div className="flex-1 p-3 md:p-4 flex gap-3 overflow-hidden">
                    {/* To Do Column */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To Do</span>
                        <span className="text-[9px] text-slate-600 ml-auto">3</span>
                      </div>
                      <div className="space-y-2 flex-1">
                        {[
                          { title: "Review Q4 report", tag: "URGENT", tagColor: "bg-amber-500/10 text-amber-400", icon: "mail", iconColor: "text-gmail" },
                          { title: "Update design specs", tag: "PENDING", tagColor: "bg-slate-700 text-slate-400", icon: "chat_bubble", iconColor: "text-slack" },
                          { title: "Schedule team sync", tag: "FYI", tagColor: "bg-slate-700 text-slate-500", icon: "calendar_month", iconColor: "text-calendar" },
                        ].map((task, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 mock-fade-in hover:border-slate-600/50 transition-colors" style={{ animationDelay: `${i * 0.3}s` }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className={`material-symbols-outlined text-xs ${task.iconColor}`}>{task.icon}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${task.tagColor}`}>{task.tag}</span>
                            </div>
                            <p className="text-[10px] text-slate-300 font-medium leading-tight">{task.title}</p>
                            <div className="flex items-center gap-1 mt-1.5">
                              <div className="h-1.5 w-8 rounded mock-shimmer" />
                              <div className="h-1.5 w-5 rounded mock-shimmer" style={{ animationDelay: `${0.5 + i * 0.2}s` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* In Progress Column */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Progress</span>
                        <span className="text-[9px] text-slate-600 ml-auto">2</span>
                      </div>
                      <div className="space-y-2 flex-1">
                        {[
                          { title: "Draft client proposal", tag: "CRITICAL", tagColor: "bg-emerald-500/10 text-emerald-400", icon: "mail", iconColor: "text-gmail", progress: 65 },
                          { title: "Fix auth bug #247", tag: "URGENT", tagColor: "bg-amber-500/10 text-amber-400", icon: "bug_report", iconColor: "text-blue-400", progress: 40 },
                        ].map((task, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-slate-800/60 border border-primary/20 mock-glow" style={{ animationDelay: `${0.6 + i * 0.4}s` }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className={`material-symbols-outlined text-xs ${task.iconColor}`}>{task.icon}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${task.tagColor}`}>{task.tag}</span>
                            </div>
                            <p className="text-[10px] text-slate-300 font-medium leading-tight">{task.title}</p>
                            {/* Progress bar */}
                            <div className="mt-2 h-1 w-full rounded-full bg-slate-700 overflow-hidden">
                              <div className="h-full rounded-full bg-primary mock-progress" style={{ width: `${task.progress}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Done Column */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Done</span>
                        <span className="text-[9px] text-slate-600 ml-auto">4</span>
                      </div>
                      <div className="space-y-2 flex-1">
                        {[
                          { title: "Send weekly update", icon: "mail", iconColor: "text-gmail" },
                          { title: "Approve PR #189", icon: "code", iconColor: "text-purple-400" },
                          { title: "Book flight for conf", icon: "calendar_month", iconColor: "text-calendar" },
                        ].map((task, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-800/30 mock-fade-in" style={{ animationDelay: `${1 + i * 0.25}s` }}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className={`material-symbols-outlined text-xs ${task.iconColor}`}>{task.icon}</span>
                              <span className="material-symbols-outlined text-xs text-emerald-500">check_circle</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium leading-tight line-through">{task.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <span className="landing-gradient-text">Intelligence Built In</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Every message, event, and notification is analyzed, prioritized, and organized automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="glass-card p-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Intelligent Extraction</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI reads your emails and messages, extracts deadlines, identifies action items, and scores
              priority — so nothing slips through the cracks.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-8">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-purple-400 text-2xl">summarize</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Proactive Briefings</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every morning, get a personalized daily briefing that summarizes what happened overnight,
              what&#39;s due today, and what needs your attention.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-8" id="security">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-emerald-400 text-2xl">shield</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Privacy-First</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your data stays under your control. FlowState runs locally with your own API keys — no
              third-party data sharing, no cloud-stored messages.
            </p>
          </div>
        </div>
      </section>

      {/* Integrations Bar */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="glass-panel p-8 text-center">
          <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-6">
            Connects with your tools
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-slate-500">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gmail text-3xl">mail</span>
              <span className="text-sm font-medium text-slate-400">Gmail</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-calendar text-3xl">calendar_month</span>
              <span className="text-sm font-medium text-slate-400">Calendar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slack text-3xl">chat</span>
              <span className="text-sm font-medium text-slate-400">Slack</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400 text-3xl">videocam</span>
              <span className="text-sm font-medium text-slate-400">Zoom</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 text-3xl">bug_report</span>
              <span className="text-sm font-medium text-slate-400">Jira</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-500 text-3xl">forum</span>
              <span className="text-sm font-medium text-slate-400">WhatsApp</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-300 text-3xl">description</span>
              <span className="text-sm font-medium text-slate-400">Notion</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="relative z-10 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">auto_awesome</span>
            </div>
            <span className="font-bold text-lg tracking-tight">
              Flow<span className="text-primary">State</span>
            </span>
          </div>

          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} FlowState. Local-first AI productivity.
          </p>

          <div className="flex items-center gap-4 text-slate-500">
            <a href="#" className="hover:text-white transition-colors">
              <span className="material-symbols-outlined">code</span>
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <span className="material-symbols-outlined">mail</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
