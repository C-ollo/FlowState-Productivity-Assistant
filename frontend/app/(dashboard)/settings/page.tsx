"use client";

import { useState } from "react";
import { useConnections, useDisconnect, useSyncPlatform } from "@/hooks/use-connections";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useProcessAllItemsAI } from "@/hooks/use-items";
import api from "@/lib/api";

const platforms = [
  {
    id: "gmail",
    name: "Gmail",
    icon: "mail",
    iconColor: "text-gmail",
    description: "Sync emails and extract action items",
  },
  {
    id: "slack",
    name: "Slack",
    icon: "alternate_email",
    iconColor: "text-slack",
    description: "Sync messages and DMs",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    icon: "calendar_month",
    iconColor: "text-calendar",
    description: "Sync events and meeting invites",
  },
];

export default function SettingsPage() {
  const { data: user } = useUser();
  const { data: connections, isLoading } = useConnections();
  const disconnect = useDisconnect();
  const syncPlatform = useSyncPlatform();
  const processAllAI = useProcessAllItemsAI();
  const logout = useLogout();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [aiProcessResult, setAiProcessResult] = useState<{ processed: number; total: number } | null>(null);

  const getConnection = (platformId: string) => {
    return connections?.find((c) => c.platform === platformId);
  };

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    try {
      const { url } = await api.getOAuthUrl(platformId);
      window.location.href = url;
    } catch (error) {
      console.error("Failed to get OAuth URL:", error);
      setConnecting(null);
    }
  };

  const handleDisconnect = (platformId: string) => {
    if (confirm(`Are you sure you want to disconnect ${platformId}?`)) {
      disconnect.mutate(platformId);
    }
  };

  const handleSync = (platformId: string) => {
    syncPlatform.mutate(platformId);
  };

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
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl space-y-8">
          {/* Profile Section */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
              Profile
            </h3>
            <div className="bg-surface-dark rounded-xl border border-border-dark p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-lg font-bold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{user?.name || "User"}</p>
                    <p className="text-xs text-text-muted">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => logout.mutate()}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </section>

          {/* Connected Accounts */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
              Connected Accounts
            </h3>
            <div className="space-y-3">
              {platforms.map((platform) => {
                const connection = getConnection(platform.id);
                const isConnected = !!connection;
                const isConnecting = connecting === platform.id;
                const isSyncing =
                  syncPlatform.isPending && syncPlatform.variables === platform.id;

                return (
                  <div
                    key={platform.id}
                    className="bg-surface-dark rounded-xl border border-border-dark p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-border-dark rounded-lg">
                          <span
                            className={`material-symbols-outlined ${platform.iconColor} text-xl`}
                          >
                            {platform.icon}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold">{platform.name}</p>
                          {isConnected ? (
                            <p className="text-xs text-text-muted">
                              {connection.external_email || "Connected"}
                            </p>
                          ) : (
                            <p className="text-xs text-text-muted">
                              {platform.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {isConnected ? (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleSync(platform.id)}
                            disabled={isSyncing}
                            className="flex items-center gap-1 text-xs text-text-muted hover:text-white transition-colors disabled:opacity-50"
                          >
                            <span
                              className={`material-symbols-outlined text-sm ${
                                isSyncing ? "animate-spin" : ""
                              }`}
                            >
                              {isSyncing ? "progress_activity" : "sync"}
                            </span>
                            {isSyncing ? "Syncing..." : "Sync"}
                          </button>
                          <span className="flex items-center gap-1 text-xs text-green-400">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            Connected
                          </span>
                          <button
                            onClick={() => handleDisconnect(platform.id)}
                            disabled={disconnect.isPending}
                            className="text-xs text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
                          >
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConnect(platform.id)}
                          disabled={isConnecting}
                          className="bg-primary text-white text-[11px] font-bold py-1.5 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {isConnecting ? (
                            <>
                              <span className="material-symbols-outlined text-sm animate-spin">
                                progress_activity
                              </span>
                              Connecting...
                            </>
                          ) : (
                            "Connect"
                          )}
                        </button>
                      )}
                    </div>

                    {isConnected && connection.status !== "active" && (
                      <div className="mt-3 p-2 bg-amber-500/10 rounded-lg">
                        <p className="text-xs text-amber-400">
                          <span className="material-symbols-outlined text-sm align-middle mr-1">
                            warning
                          </span>
                          Connection status: {connection.status}. Please reconnect.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* AI Settings */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
              AI Processing
            </h3>
            <div className="bg-surface-dark rounded-xl border border-border-dark p-4 space-y-4">
              {/* Process All Button */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Process Inbox with AI</p>
                  <p className="text-xs text-text-muted">
                    Generate summaries, extract deadlines, and classify messages
                  </p>
                </div>
                <button
                  onClick={() => {
                    processAllAI.mutate(undefined, {
                      onSuccess: (data) => {
                        setAiProcessResult({ processed: data.processed, total: data.total });
                      },
                    });
                  }}
                  disabled={processAllAI.isPending}
                  className="bg-primary text-white text-[11px] font-bold py-1.5 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {processAllAI.isPending ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">
                        progress_activity
                      </span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">
                        auto_awesome
                      </span>
                      Process All
                    </>
                  )}
                </button>
              </div>

              {aiProcessResult && (
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <p className="text-xs text-green-400">
                    <span className="material-symbols-outlined text-sm align-middle mr-1">
                      check_circle
                    </span>
                    Processed {aiProcessResult.processed} of {aiProcessResult.total} items
                  </p>
                </div>
              )}

              {processAllAI.isError && (
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <p className="text-xs text-red-400">
                    <span className="material-symbols-outlined text-sm align-middle mr-1">
                      error
                    </span>
                    AI processing failed. Check your API key configuration.
                  </p>
                </div>
              )}

              <div className="border-t border-border-dark"></div>

              <div className="text-xs text-text-muted">
                <p className="mb-2">AI processing includes:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Smart summaries for each message</li>
                  <li>Deadline extraction with due dates</li>
                  <li>Action classification (reply needed, review, etc.)</li>
                  <li>Priority scoring (1-100)</li>
                  <li>Category detection (work, school, personal)</li>
                </ul>
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
