"use client";

const connections = [
  {
    id: "gmail",
    name: "Gmail",
    icon: "mail",
    iconColor: "text-gmail",
    connected: true,
    account: "user@gmail.com",
    lastSync: "2 minutes ago",
  },
  {
    id: "slack",
    name: "Slack",
    icon: "alternate_email",
    iconColor: "text-slack",
    connected: true,
    account: "Acme Inc Workspace",
    lastSync: "5 minutes ago",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    icon: "calendar_month",
    iconColor: "text-calendar",
    connected: false,
  },
];

export default function SettingsPage() {
  return (
    <>
      {/* Header Section */}
      <header className="border-b border-border-dark px-8 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Settings</h2>
        <div className="flex items-center gap-4">
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
        <div className="max-w-2xl space-y-8">
          {/* Connected Accounts */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
              Connected Accounts
            </h3>
            <div className="space-y-3">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className="bg-surface-dark rounded-xl border border-border-dark p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-border-dark rounded-lg">
                        <span
                          className={`material-symbols-outlined ${conn.iconColor} text-xl`}
                        >
                          {conn.icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold">{conn.name}</p>
                        {conn.connected ? (
                          <p className="text-xs text-text-muted">
                            {conn.account} • Last sync: {conn.lastSync}
                          </p>
                        ) : (
                          <p className="text-xs text-text-muted">Not connected</p>
                        )}
                      </div>
                    </div>
                    {conn.connected ? (
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                          Connected
                        </span>
                        <button className="text-xs text-text-muted hover:text-red-400 transition-colors">
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button className="bg-primary text-white text-[11px] font-bold py-1.5 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Settings */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
              AI Settings
            </h3>
            <div className="bg-surface-dark rounded-xl border border-border-dark p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Auto-summarize messages</p>
                  <p className="text-xs text-text-muted">
                    Generate AI summaries for incoming messages
                  </p>
                </div>
                <button className="relative w-11 h-6 bg-primary rounded-full transition-colors">
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>
                </button>
              </div>
              <div className="border-t border-border-dark"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Extract deadlines</p>
                  <p className="text-xs text-text-muted">
                    Automatically detect and extract deadlines from messages
                  </p>
                </div>
                <button className="relative w-11 h-6 bg-primary rounded-full transition-colors">
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>
                </button>
              </div>
              <div className="border-t border-border-dark"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Morning briefings</p>
                  <p className="text-xs text-text-muted">
                    Receive AI-generated daily briefings at 7:00 AM
                  </p>
                </div>
                <button className="relative w-11 h-6 bg-primary rounded-full transition-colors">
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>
                </button>
              </div>
            </div>
          </section>

          {/* Privacy Notice */}
          <section>
            <div className="bg-surface-dark rounded-xl border border-border-dark p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-green-400">
                verified_user
              </span>
              <div>
                <p className="text-sm font-bold mb-1">Privacy-First Architecture</p>
                <p className="text-xs text-text-muted leading-relaxed">
                  All AI processing uses your personal API key. Your data never
                  leaves your device and is never stored on external servers.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
