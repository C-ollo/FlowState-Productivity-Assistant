"use client";

import { Sparkles, Send } from "lucide-react";

export function AISidebar() {
  return (
    <aside className="flex h-full w-80 flex-col border-l border-border bg-surface">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-text">AI Assistant</h2>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* User Message */}
        <div className="flex justify-end">
          <div className="rounded-lg bg-primary px-3 py-2 text-sm text-white max-w-[85%]">
            What&apos;s due this week?
          </div>
        </div>

        {/* AI Response */}
        <div className="flex justify-start">
          <div className="rounded-lg bg-surface-hover px-3 py-2 text-sm text-text max-w-[85%]">
            <p className="mb-2">You have 3 project milestones:</p>
            <ul className="list-disc list-inside space-y-1 text-text-secondary">
              <li>Q4 Budget Approval (Thu)</li>
              <li>Team Design Sync (Fri)</li>
              <li>Hiring Roadmap Update (Fri)</li>
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
          Summarize Slack #marketing
        </button>

        {/* Another AI Response */}
        <div className="flex justify-start">
          <div className="rounded-lg bg-surface-hover px-3 py-2 text-sm text-text max-w-[85%]">
            <p>
              The marketing team is focusing on the &quot;Holiday Launch&quot; campaign. 2 new
              assets were uploaded, and the influencer list is finalized.
            </p>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask anything..."
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-4 pr-10 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-primary hover:bg-primary/10">
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex gap-2">
          <button className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary hover:border-primary hover:text-primary transition-colors">
            Next deadline?
          </button>
          <button className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary hover:border-primary hover:text-primary transition-colors">
            Daily recap
          </button>
        </div>
      </div>
    </aside>
  );
}
