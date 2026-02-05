"use client";

import { Mail, MessageSquare, Calendar, Check, X } from "lucide-react";

const connections = [
  {
    id: "gmail",
    name: "Gmail",
    icon: Mail,
    color: "text-gmail",
    bgColor: "bg-gmail/10",
    connected: true,
    email: "user@gmail.com",
    lastSync: "2 minutes ago",
  },
  {
    id: "slack",
    name: "Slack",
    icon: MessageSquare,
    color: "text-slack",
    bgColor: "bg-slack/10",
    connected: true,
    workspace: "Acme Inc",
    lastSync: "5 minutes ago",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    icon: Calendar,
    color: "text-calendar",
    bgColor: "bg-calendar/10",
    connected: false,
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-text-muted mt-1">
          Manage your connected accounts and preferences
        </p>
      </div>

      {/* Connected Accounts */}
      <section>
        <h2 className="text-lg font-semibold text-text mb-4">
          Connected Accounts
        </h2>
        <div className="space-y-3">
          {connections.map((conn) => (
            <div
              key={conn.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${conn.bgColor}`}
                >
                  <conn.icon className={`h-5 w-5 ${conn.color}`} />
                </div>
                <div>
                  <p className="font-medium text-text">{conn.name}</p>
                  {conn.connected ? (
                    <p className="text-sm text-text-muted">
                      {conn.email || conn.workspace} • Last sync: {conn.lastSync}
                    </p>
                  ) : (
                    <p className="text-sm text-text-muted">Not connected</p>
                  )}
                </div>
              </div>
              {conn.connected ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-sm text-success">
                    <Check className="h-4 w-4" />
                    Connected
                  </span>
                  <button className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:border-urgent hover:text-urgent transition-colors">
                    Disconnect
                  </button>
                </div>
              ) : (
                <button className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors">
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* AI Settings */}
      <section>
        <h2 className="text-lg font-semibold text-text mb-4">AI Settings</h2>
        <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">Auto-summarize messages</p>
              <p className="text-sm text-text-muted">
                Generate AI summaries for incoming messages
              </p>
            </div>
            <button className="relative h-6 w-11 rounded-full bg-primary transition-colors">
              <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-transform" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">Extract deadlines</p>
              <p className="text-sm text-text-muted">
                Automatically detect and extract deadlines from messages
              </p>
            </div>
            <button className="relative h-6 w-11 rounded-full bg-primary transition-colors">
              <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-transform" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">Morning briefings</p>
              <p className="text-sm text-text-muted">
                Receive AI-generated daily briefings at 7:00 AM
              </p>
            </div>
            <button className="relative h-6 w-11 rounded-full bg-primary transition-colors">
              <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Privacy Notice */}
      <section className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
            <Check className="h-4 w-4 text-success" />
          </div>
          <div>
            <p className="font-medium text-text">Privacy-First Architecture</p>
            <p className="text-sm text-text-muted mt-1">
              All AI processing uses your personal API key. Your data never
              leaves your device and is never stored on external servers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
